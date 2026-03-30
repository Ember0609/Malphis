import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  LinearProgress,
  Alert,
  InputAdornment,
  Chip,
  Divider,
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LanguageIcon from '@mui/icons-material/Language';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VerifiedIcon from '@mui/icons-material/Verified';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/url/predict';

export default function URLTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(API_URL, { url: url.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleScan();
  };

  const handleReset = () => {
    setUrl('');
    setResult(null);
    setError(null);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              boxShadow: '0 0 30px rgba(139,92,246,0.3)',
            }}
          >
            <LanguageIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ตรวจจับ URL อันตราย
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ป้อน URL เพื่อตรวจสอบด้วย Neural Network
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* URL Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
            <LinkIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom', color: 'secondary.main' }} />
            ป้อน URL ที่ต้องการตรวจสอบ
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="เช่น https://example.com หรือ suspicious-site.xyz/login"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(17,24,39,0.5)',
                fontSize: '1.05rem',
                '& fieldset': { borderColor: 'rgba(139,92,246,0.25)' },
                '&:hover fieldset': { borderColor: 'secondary.main' },
                '&.Mui-focused fieldset': { borderColor: 'secondary.main' },
              },
            }}
          />

          {/* Example URLs */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              ตัวอย่าง URL สำหรับทดสอบ:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                'google.com',
                'phishing-login.suspicious.tk/verify-account',
                'https://github.com',
                '192.168.1.1/admin/login.php',
              ].map((example) => (
                <Button
                  key={example}
                  size="small"
                  variant="outlined"
                  onClick={() => { setUrl(example); setResult(null); setError(null); }}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.72rem',
                    borderColor: 'rgba(139,92,246,0.2)',
                    color: 'text.secondary',
                    '&:hover': { borderColor: 'secondary.main', color: 'secondary.light' },
                  }}
                >
                  {example.length > 35 ? example.slice(0, 35) + '...' : example}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleScan}
              disabled={!url.trim() || loading}
              startIcon={<SearchIcon />}
              fullWidth
              sx={{
                py: 1.5,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                '&:hover': { background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
              }}
            >
              {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ URL'}
            </Button>
            {(url || result) && (
              <Button
                variant="outlined"
                size="large"
                onClick={handleReset}
                startIcon={<RestartAltIcon />}
                sx={{ minWidth: 120, borderColor: 'rgba(139,92,246,0.3)', color: 'secondary.light' }}
              >
                เริ่มใหม่
              </Button>
            )}
          </Box>

          {loading && <LinearProgress color="secondary" sx={{ mt: 2, borderRadius: 1 }} />}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </Alert>
      )}

      {/* Result */}
      {result && (
        <Card
          sx={{
            border: result.is_safe
              ? '1px solid rgba(16,185,129,0.4)'
              : '1px solid rgba(239,68,68,0.4)',
            boxShadow: result.is_safe
              ? '0 0 40px rgba(16,185,129,0.15)'
              : '0 0 40px rgba(239,68,68,0.15)',
            animation: 'fadeIn 0.4s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(12px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Icon */}
            <Box
              sx={{
                width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: result.is_safe
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))'
                  : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
                border: `2px solid ${result.is_safe ? '#10b981' : '#ef4444'}`,
                boxShadow: `0 0 30px ${result.is_safe ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}
            >
              {result.is_safe ? (
                <CheckCircleIcon sx={{ fontSize: 44, color: 'success.main' }} />
              ) : (
                <WarningAmberIcon sx={{ fontSize: 44, color: 'error.main' }} />
              )}
            </Box>

            {/* Title */}
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: result.is_safe ? 'success.light' : 'error.light' }}>
              {result.is_safe ? 'URL ปลอดภัย' : '⚠️ URL อันตราย!'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              ผลการวิเคราะห์: <strong style={{ color: result.is_safe ? '#34d399' : '#f87171' }}>{result.prediction}</strong>
            </Typography>

            {/* Verified Badge (Top 1M) */}
            {result.note && (
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 18 }} />}
                label={result.note}
                sx={{
                  mb: 3,
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(16,185,129,0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.3)',
                  '& .MuiChip-icon': { color: '#34d399' },
                }}
              />
            )}

            {/* AI Analyzed Badge */}
            {!result.note && (
              <Chip
                icon={<SmartToyIcon sx={{ fontSize: 18 }} />}
                label="วิเคราะห์โดย Neural Network"
                sx={{
                  mb: 3,
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(139,92,246,0.12)',
                  color: '#a78bfa',
                  border: '1px solid rgba(139,92,246,0.3)',
                  '& .MuiChip-icon': { color: '#a78bfa' },
                }}
              />
            )}

            {/* Confidence Bar */}
            <Box sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>ความมั่นใจ</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: result.is_safe ? 'success.light' : 'error.light' }}>
                  {result.confidence}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={result.confidence}
                sx={{
                  height: 10, borderRadius: 5,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: result.is_safe
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : 'linear-gradient(90deg, #ef4444, #f87171)',
                  },
                }}
              />
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(139,92,246,0.1)' }} />

            {/* Detail Info */}
            <Box
              sx={{
                p: 2.5, borderRadius: 2,
                bgcolor: 'rgba(17,24,39,0.5)',
                border: '1px solid rgba(139,92,246,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {/* URL */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  URL:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#a78bfa',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                  }}
                >
                  {result.url}
                </Typography>
              </Box>

              {/* Features Extracted */}
              {result.features_extracted && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FingerprintIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Features ที่สกัดได้:
                  </Typography>
                  <Chip
                    label={`${result.features_extracted} features`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(139,92,246,0.12)',
                      color: '#c4b5fd',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}
                  />
                </Box>
              )}

              {/* Verification Source */}
              {result.note && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedIcon sx={{ fontSize: 16, color: '#34d399' }} />
                  <Typography variant="caption" sx={{ color: '#6ee7b7' }}>
                    {result.note}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
