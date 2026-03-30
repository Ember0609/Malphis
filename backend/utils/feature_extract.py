import re
import math
from urllib.parse import urlparse, parse_qs
from collections import Counter
import numpy as np

# ---------------------------------------------------------------------------
# Malware PE Feature Extraction
# ---------------------------------------------------------------------------

def calculate_entropy(data):
    """คำนวณความยุ่งเหยิงของข้อมูล (Shannon Entropy)"""
    if not data:
        return 0.0
    entropy = 0
    for x in range(256):
        p_x = float(data.count(x)) / len(data)
        if p_x > 0:
            entropy += - p_x * math.log(p_x, 2)
    return entropy

def extract_pe_features(pe, file_bytes: bytes) -> dict:
    features = {}
    
    try:
        features['ImageBase'] = pe.OPTIONAL_HEADER.ImageBase
        features['MajorOperatingSystemVersion'] = pe.OPTIONAL_HEADER.MajorOperatingSystemVersion
        features['MinorOperatingSystemVersion'] = pe.OPTIONAL_HEADER.MinorOperatingSystemVersion
        features['MajorSubsystemVersion'] = pe.OPTIONAL_HEADER.MajorSubsystemVersion
        features['MinorSubsystemVersion'] = pe.OPTIONAL_HEADER.MinorSubsystemVersion
        features['Subsystem'] = pe.OPTIONAL_HEADER.Subsystem
        features['SizeOfStackReserve'] = pe.OPTIONAL_HEADER.SizeOfStackReserve
        features['SizeOfHeapReserve'] = pe.OPTIONAL_HEADER.SizeOfHeapReserve
        features['SizeOfHeapCommit'] = pe.OPTIONAL_HEADER.SizeOfHeapCommit
        
        fh_char = pe.FILE_HEADER.Characteristics
        features['FH_char0'] = (fh_char >> 0) & 1
        features['FH_char2'] = (fh_char >> 2) & 1
        features['FH_char3'] = (fh_char >> 3) & 1
        features['FH_char12'] = (fh_char >> 12) & 1
        
        dll_char = pe.OPTIONAL_HEADER.DllCharacteristics
        features['OH_DLLchar0'] = (dll_char >> 0) & 1
        features['OH_DLLchar2'] = (dll_char >> 2) & 1
        features['OH_DLLchar7'] = (dll_char >> 7) & 1
        
        features['E_file'] = calculate_entropy(file_bytes)
        
        e_text = 0.0
        e_data = 0.0
        sus_sections = 0
        standard_sections = [b'.text', b'.data', b'.rdata', b'.rsrc', b'.bss', b'.edata', b'.idata', b'.pdata', b'.reloc']
        
        for section in pe.sections:
            name = section.Name.replace(b'\x00', b'')
            if name == b'.text':
                e_text = calculate_entropy(section.get_data())
            elif name == b'.data':
                e_data = calculate_entropy(section.get_data())
            
            if name not in standard_sections:
                sus_sections += 1
                
        features['E_text'] = e_text
        features['E_data'] = e_data
        features['sus_sections'] = sus_sections
        
        features['fileinfo'] = 1 if hasattr(pe, 'FileInfo') and len(pe.FileInfo) > 0 else 0

        # --- เพิ่มการดึงค่า Raw Features ก่อนแปลง ---
        features['SizeOfCode'] = getattr(pe.OPTIONAL_HEADER, 'SizeOfCode', 0)
        features['SizeOfInitializedData'] = getattr(pe.OPTIONAL_HEADER, 'SizeOfInitializedData', 0)
        features['SizeOfImage'] = getattr(pe.OPTIONAL_HEADER, 'SizeOfImage', 0)
        features['filesize'] = len(file_bytes)

        # --- คำนวณ Engineered Features แบบเดียวกับตอน Train ---
        features['Code_to_Image_Ratio'] = features['SizeOfCode'] / (features['SizeOfImage'] + 1e-5)
        features['InitData_to_Image_Ratio'] = features['SizeOfInitializedData'] / (features['SizeOfImage'] + 1e-5)
        features['Entropy_Diff'] = abs(features['E_text'] - features['E_data'])

        for col in ['filesize', 'SizeOfCode', 'SizeOfInitializedData', 'SizeOfImage']:
            features[f'Log_{col}'] = np.log1p(features[col])

    except Exception as e:
        pass

    return features

# ---------------------------------------------------------------------------
# URL Feature Extraction
# ---------------------------------------------------------------------------

URL_FEATURE_COLUMNS = [
    "url_len", "@", "?", "-", "=", ".", "#", "%", "+", "$", "!",
    "*", ",", "//", "digits", "letters",
    "abnormal_url", "https", "Shortining_Service", "having_ip_address",
    "defac_has_hacked_terms", "defac_has_suspicious_ext",
    "defac_path_depth", "defac_is_deep_path", "defac_path_underscores",
    "defac_is_gov_edu", "defac_has_index_php", "defac_has_option_param",
    "phish_has_brand", "phish_brand_in_subdomain", "phish_brand_in_path",
    "phish_hyphen_count", "phish_digit_count", "phish_long_domain",
    "phish_many_subdomains", "phish_suspicious_tld", "phish_keyword_count",
    "phish_has_redirect", "phish_param_count", "phish_encoded_chars",
    "enh_urgency_count", "enh_security_count", "enh_brand_count",
    "enh_brand_hijack", "enh_subdomain_count", "enh_long_path",
    "enh_many_params", "enh_suspicious_tld",
    "adv_domain_ngram_entropy", "adv_path_entropy",
    "adv_consonant_ratio", "adv_vowel_ratio", "adv_digit_ratio",
    "adv_subdomain_count", "adv_avg_subdomain_len",
    "adv_token_count", "adv_avg_token_length",
]

SHORTENING_SERVICES = [
    "bit.ly", "goo.gl", "shorte.st", "go2l.ink", "x.co", "ow.ly",
    "t.co", "tinyurl.com", "tr.im", "is.gd", "cli.gs", "yfrog.com",
    "migre.me", "ff.im", "tiny.cc", "url4.eu", "twit.ac", "su.pr",
    "twurl.nl", "snipurl.com", "short.to", "budurl.com", "ping.fm",
    "post.ly", "just.as", "bkite.com", "snipr.com", "fic.kr",
    "loopt.us", "doiop.com", "short.ie", "kl.am", "wp.me", "rubyurl.com",
    "om.ly", "to.ly", "bit.do", "lnkd.in", "db.tt", "qr.ae",
    "adf.ly", "cur.lv", "ity.im", "q.gs", "po.st", "bc.vc",
    "twitthis.com", "u.to", "j.mp", "buzurl.com", "cutt.us",
    "u.bb", "yourls.org", "prettylinkpro.com", "scrnch.me", "filourl.com",
    "vzturl.com", "qr.net", "1url.com", "tweez.me", "v.gd", "link.zip.net",
]

BRAND_NAMES = [
    "google", "facebook", "apple", "amazon", "microsoft", "paypal",
    "netflix", "instagram", "twitter", "linkedin", "dropbox", "yahoo",
    "chase", "wellsfargo", "bankofamerica", "citibank", "hsbc",
    "dhl", "fedex", "ups", "usps",
]

SUSPICIOUS_TLDS = [
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club",
    ".online", ".site", ".info", ".buzz", ".icu", ".work", ".click",
]

HACKED_TERMS = ["hacked", "pwned", "defaced", "owned", "r00t", "shell"]
SUSPICIOUS_EXTS = [".php", ".asp", ".aspx", ".jsp", ".cgi"]
URGENCY_WORDS = ["urgent", "immediately", "alert", "warning", "suspend", "verify", "expire", "confirm"]
SECURITY_WORDS = ["secure", "security", "login", "signin", "account", "update", "password"]

def _entropy(text: str) -> float:
    if not text:
        return 0.0
    freq = Counter(text)
    length = len(text)
    return -sum((c / length) * math.log2(c / length) for c in freq.values())

def _ngram_entropy(text: str, n: int = 2) -> float:
    if len(text) < n:
        return 0.0
    ngrams = [text[i:i + n] for i in range(len(text) - n + 1)]
    freq = Counter(ngrams)
    total = len(ngrams)
    return -sum((c / total) * math.log2(c / total) for c in freq.values())

def extract_url_features(url_str: str) -> dict:
    features = {}

    parse_url = url_str
    if not parse_url.startswith(("http://", "https://")):
        parse_url = "http://" + parse_url

    parsed = urlparse(parse_url)
    hostname = parsed.hostname or ""
    path = parsed.path or ""
    query = parsed.query or ""
    url_lower = url_str.lower()

    # -- Basic URL features --
    features["url_len"] = len(url_str)
    features["@"] = url_str.count("@")
    features["?"] = url_str.count("?")
    features["-"] = url_str.count("-")
    features["="] = url_str.count("=")
    features["."] = url_str.count(".")
    features["#"] = url_str.count("#")
    features["%"] = url_str.count("%")
    features["+"] = url_str.count("+")
    features["$"] = url_str.count("$")
    features["!"] = url_str.count("!")
    features["*"] = url_str.count("*")
    features[","] = url_str.count(",")
    features["//"] = url_str.count("//")
    features["digits"] = sum(c.isdigit() for c in url_str)
    features["letters"] = sum(c.isalpha() for c in url_str)

    # -- Binary flags --
    features["abnormal_url"] = 1 if hostname not in url_str else 0
    features["https"] = 1 if parsed.scheme == "https" else 0
    features["Shortining_Service"] = 1 if any(s in url_lower for s in SHORTENING_SERVICES) else 0
    ip_pattern = re.compile(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")
    features["having_ip_address"] = 1 if ip_pattern.search(hostname) else 0

    # -- Defacement features --
    features["defac_has_hacked_terms"] = 1 if any(t in url_lower for t in HACKED_TERMS) else 0
    features["defac_has_suspicious_ext"] = 1 if any(url_lower.endswith(e) for e in SUSPICIOUS_EXTS) else 0
    path_parts = [p for p in path.split("/") if p]
    features["defac_path_depth"] = len(path_parts)
    features["defac_is_deep_path"] = 1 if len(path_parts) > 4 else 0
    features["defac_path_underscores"] = path.count("_")
    features["defac_is_gov_edu"] = 1 if hostname.endswith((".gov", ".edu")) else 0
    features["defac_has_index_php"] = 1 if "index.php" in url_lower else 0
    features["defac_has_option_param"] = 1 if "option=" in url_lower else 0

    # -- Phishing features --
    features["phish_has_brand"] = 1 if any(b in url_lower for b in BRAND_NAMES) else 0
    subdomains = hostname.split(".")[:-2] if hostname.count(".") >= 2 else []
    subdomain_str = ".".join(subdomains)
    features["phish_brand_in_subdomain"] = 1 if any(b in subdomain_str for b in BRAND_NAMES) else 0
    features["phish_brand_in_path"] = 1 if any(b in path.lower() for b in BRAND_NAMES) else 0
    features["phish_hyphen_count"] = hostname.count("-")
    features["phish_digit_count"] = sum(c.isdigit() for c in hostname)
    features["phish_long_domain"] = 1 if len(hostname) > 30 else 0
    features["phish_many_subdomains"] = 1 if len(subdomains) > 2 else 0
    features["phish_suspicious_tld"] = 1 if any(hostname.endswith(t) for t in SUSPICIOUS_TLDS) else 0

    suspicious_keywords = ["login", "signin", "verify", "update", "secure", "account", "confirm", "bank", "password"]
    features["phish_keyword_count"] = sum(1 for kw in suspicious_keywords if kw in url_lower)
    features["phish_has_redirect"] = 1 if "redirect" in url_lower or "url=" in url_lower else 0
    params = parse_qs(query)
    features["phish_param_count"] = len(params)
    features["phish_encoded_chars"] = url_str.count("%")

    # -- Enhanced features --
    features["enh_urgency_count"] = sum(1 for w in URGENCY_WORDS if w in url_lower)
    features["enh_security_count"] = sum(1 for w in SECURITY_WORDS if w in url_lower)
    features["enh_brand_count"] = sum(1 for b in BRAND_NAMES if b in url_lower)
    features["enh_brand_hijack"] = 1 if features["phish_brand_in_subdomain"] and not hostname.endswith(tuple(f".{b}.com" for b in BRAND_NAMES)) else 0
    features["enh_subdomain_count"] = len(subdomains)
    features["enh_long_path"] = 1 if len(path) > 100 else 0
    features["enh_many_params"] = 1 if len(params) > 3 else 0
    features["enh_suspicious_tld"] = features["phish_suspicious_tld"]

    # -- Advanced features --
    domain_no_tld = ".".join(hostname.split(".")[:-1]) if "." in hostname else hostname
    features["adv_domain_ngram_entropy"] = _ngram_entropy(domain_no_tld)
    features["adv_path_entropy"] = _entropy(path)

    alpha_chars = [c for c in hostname if c.isalpha()]
    vowels = set("aeiouAEIOU")
    consonants = set("bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ")
    total_alpha = len(alpha_chars) if alpha_chars else 1
    features["adv_consonant_ratio"] = sum(1 for c in alpha_chars if c in consonants) / total_alpha
    features["adv_vowel_ratio"] = sum(1 for c in alpha_chars if c in vowels) / total_alpha
    features["adv_digit_ratio"] = sum(1 for c in hostname if c.isdigit()) / max(len(hostname), 1)
    features["adv_subdomain_count"] = len(subdomains)
    features["adv_avg_subdomain_len"] = np.mean([len(s) for s in subdomains]) if subdomains else 0.0

    tokens = re.split(r"[./?&=\-_]", url_str)
    tokens = [t for t in tokens if t]
    features["adv_token_count"] = len(tokens)
    features["adv_avg_token_length"] = np.mean([len(t) for t in tokens]) if tokens else 0.0

    return features