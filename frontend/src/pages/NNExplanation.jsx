import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Link,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DatasetIcon from '@mui/icons-material/Dataset';
import TuneIcon from '@mui/icons-material/Tune';

const glowBox = {
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 'inherit',
    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))',
    zIndex: -1,
    filter: 'blur(20px)',
  },
};

export default function NNExplanation() {
  const features = [
    'url_len', 'digits', 'letters', '@', '?', '-', '=', '.',
    'https', 'having_ip_address', 'Shortining_Service', 'abnormal_url',
    'phish_has_brand', 'phish_keyword_count', 'defac_path_depth',
    'adv_domain_ngram_entropy', 'adv_path_entropy', 'enh_subdomain_count',
  ];

  const layers = [
    { name: 'Input Layer', neurons: '57 features', color: '#3b82f6' },
    { name: 'Dense Layer 1', neurons: '128 neurons (ReLU)', color: '#6366f1' },
    { name: 'Dropout 1', neurons: '30% dropout', color: '#8b5cf6' },
    { name: 'Dense Layer 2', neurons: '64 neurons (ReLU)', color: '#a78bfa' },
    { name: 'Dropout 2', neurons: '30% dropout', color: '#8b5cf6' },
    { name: 'Output Layer', neurons: '1 neuron (Sigmoid)', color: '#10b981' },
  ];

  const steps = [
    {
      label: 'โหลดข้อมูล URL ดิบ',
      desc: 'อ่านข้อมูลจาก Url.csv ซึ่งประกอบด้วย URL ดิบและ label (0=Safe, 1=Malicious)',
    },
    {
      label: 'สกัด Features ด้วย extract_url_features()',
      desc: 'วนลูปแต่ละ URL ผ่านฟังก์ชัน extract_url_features() เพื่อแปลงเป็นตัวเลข 57 คอลัมน์ แล้วเรียงลำดับตาม URL_FEATURE_COLUMNS',
    },
    {
      label: 'จัดการค่าที่หายไป (Imputation)',
      desc: 'ใช้ SimpleImputer ด้วย strategy="median" เพื่อแทนค่า NaN ที่อาจเกิดจากการสกัดฟีเจอร์ไม่สำเร็จ',
    },
    {
      label: 'แบ่งและปรับสเกลข้อมูล',
      desc: 'แบ่ง 80:20 ด้วย train_test_split (random_state=42) แล้วปรับสเกลด้วย StandardScaler',
    },
    {
      label: 'สร้างสถาปัตยกรรม Neural Network',
      desc: 'สร้าง Sequential Model: Dense(128, ReLU) → Dropout(0.3) → Dense(64, ReLU) → Dropout(0.3) → Dense(1, Sigmoid)',
    },
    {
      label: 'Compile และ Train',
      desc: 'ใช้ loss="binary_crossentropy", optimizer="adam", epochs=10, batch_size=32, validation_split=0.2',
    },
    {
      label: 'บันทึกโมเดล',
      desc: 'บันทึก Keras model (.keras), scaler (.pkl) และ imputer (.pkl) ด้วย joblib ไปที่โฟลเดอร์ models/',
    },
  ];

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: '0 0 30px rgba(139,92,246,0.3)',
            }}
          >
            <PsychologyIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Neural Network Model
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ระบบตรวจจับ URL อันตราย ด้วย Deep Neural Network
            </Typography>
          </Box>
        </Box>
        <Chip label="Deep Neural Network" size="small" sx={{ mr: 1, bgcolor: 'rgba(139,92,246,0.15)', color: 'secondary.light' }} />
        <Chip label="Keras / TensorFlow" size="small" sx={{ mr: 1, bgcolor: 'rgba(59,130,246,0.15)', color: 'primary.light' }} />
        <Chip label="Binary Classification" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: 'success.light' }} />
      </Box>

      {/* 1. Data Preparation */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <StorageIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="h5">1. การเตรียมข้อมูล (Data Preparation)</Typography>
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            ใช้ชุดข้อมูล <strong style={{ color: '#a78bfa' }}>Url.csv</strong> ซึ่งประกอบด้วย URL ดิบ จากนั้นใช้ฟังก์ชัน{' '}
            <strong style={{ color: '#a78bfa' }}>extract_url_features()</strong> สกัดคุณลักษณะออกมาเป็นตัวเลข
            รวม <strong style={{ color: '#34d399' }}>57 Features</strong> ใน 6 กลุ่มหลัก สำหรับจำแนก URL ว่าปลอดภัยหรืออันตราย (Phishing / Defacement)
          </Typography>

          <Typography variant="subtitle2" sx={{ color: 'secondary.light', mb: 2 }}>
            <DatasetIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
            ตัวอย่าง Features สำคัญ:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {features.map((f) => (
              <Chip
                key={f}
                label={f}
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(139,92,246,0.3)', color: 'text.secondary', fontSize: '0.75rem' }}
              />
            ))}
            <Chip label="... และอีก 39 features" size="small" sx={{ bgcolor: 'rgba(139,92,246,0.1)', color: 'secondary.light', fontSize: '0.75rem' }} />
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
            กลุ่ม Features แบ่งเป็น 6 หมวด: <strong style={{ color: '#60a5fa' }}>Basic</strong> (ความยาว, ตัวอักษรพิเศษ, digits, letters),{' '}
            <strong style={{ color: '#60a5fa' }}>Binary Flags</strong> (HTTPS, IP address, short URL),{' '}
            <strong style={{ color: '#60a5fa' }}>Defacement</strong> (path depth, hacked terms),{' '}
            <strong style={{ color: '#60a5fa' }}>Phishing</strong> (brand names, suspicious TLD, keywords),{' '}
            <strong style={{ color: '#60a5fa' }}>Enhanced</strong> (urgency/security words, brand hijack) และ{' '}
            <strong style={{ color: '#60a5fa' }}>Advanced</strong> (entropy, n-gram, consonant/vowel ratio)
          </Typography>
        </CardContent>
      </Card>

      {/* 2. Algorithm Theory */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <AutoFixHighIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="h5">2. ทฤษฎีอัลกอริทึม (Algorithm Theory)</Typography>
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            ใช้ <strong style={{ color: '#a78bfa' }}>Deep Neural Network (DNN)</strong> แบบ Sequential 
            ซึ่งเป็นโครงข่ายประสาทเทียม 2 Hidden Layers (128 → 64 neurons) พร้อม Dropout 30%
            ที่สามารถเรียนรู้ patterns จาก 57 Features ได้อย่างมีประสิทธิภาพ
          </Typography>

          <Divider sx={{ borderColor: 'rgba(139,92,246,0.1)', my: 3 }} />

          <Typography variant="subtitle2" sx={{ color: 'secondary.light', mb: 2 }}>
            สถาปัตยกรรม Neural Network:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {layers.map((layer, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(17,24,39,0.5)',
                  border: `1px solid ${layer.color}30`,
                  transition: 'all 0.3s',
                  '&:hover': { bgcolor: `${layer.color}10`, transform: 'translateX(8px)' },
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: layer.color,
                    boxShadow: `0 0 10px ${layer.color}80`,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 140 }}>
                  {layer.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {layer.neurons}
                </Typography>
                {i < layers.length - 1 && (
                  <Typography sx={{ color: 'text.secondary', ml: 'auto', fontSize: '0.8rem' }}>↓</Typography>
                )}
              </Box>
            ))}
          </Box>

          <Divider sx={{ borderColor: 'rgba(139,92,246,0.1)', my: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#60a5fa', mb: 0.5 }}>
                🔥 Activation Function: ReLU (Rectified Linear Unit)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                f(x) = max(0, x) — ใช้ใน Hidden Layers เพื่อเพิ่ม Non-Linearity ให้โมเดลเรียนรู้ patterns ที่ซับซ้อนได้ 
                มีข้อดีคือคำนวณเร็วและลดปัญหา Vanishing Gradient
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#10b981', mb: 0.5 }}>
                📊 Output: Sigmoid Function
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                σ(x) = 1/(1+e⁻ˣ) — แปลงค่า Output เป็นช่วง [0, 1] เพื่อใช้เป็นค่าความน่าจะเป็น 
                ถ้า ≥ 0.5 = Malicious, ถ้า &lt; 0.5 = Safe
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#f59e0b', mb: 0.5 }}>
                🛡️ Dropout Regularization (30%)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                สุ่มปิด 30% ของ Neurons ในแต่ละรอบการ Train เพื่อป้องกัน Overfitting 
                ทำให้โมเดลเรียนรู้ Features ที่หลากหลายมากขึ้น และลดการพึ่งพา Neurons ชุดใดชุดหนึ่งมากเกินไป
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 3. Development Steps */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <AccountTreeIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="h5">3. ขั้นตอนการพัฒนาโมเดล</Typography>
          </Box>

          <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { borderColor: 'rgba(139,92,246,0.3)' } }}>
            {steps.map((step, i) => (
              <Step key={i} active expanded>
                <StepLabel
                  StepIconProps={{
                    sx: { color: 'secondary.main', '&.Mui-active': { color: 'secondary.main' } },
                  }}
                >
                  <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, pb: 2 }}>
                    {step.desc}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ borderColor: 'rgba(139,92,246,0.1)', my: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TuneIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ color: 'secondary.light' }}>Hyperparameters</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {[
              { k: 'Loss Function', v: 'Binary Crossentropy' },
              { k: 'Optimizer', v: 'Adam' },
              { k: 'Epochs', v: '10' },
              { k: 'Batch Size', v: '32' },
              { k: 'Validation Split', v: '20%' },
              { k: 'Dropout Rate', v: '0.3 (30%)' },
            ].map((p) => (
              <Box key={p.k} sx={{ p: 1.5, bgcolor: 'rgba(139,92,246,0.05)', borderRadius: 2, border: '1px solid rgba(139,92,246,0.1)' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{p.k}</Typography>
                <Typography variant="body2" sx={{ color: 'secondary.light', fontWeight: 600 }}>{p.v}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* 4. References */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <MenuBookIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="h5">4. แหล่งอ้างอิง (References)</Typography>
          </Box>
          <List dense>
            {[
              { title: 'TensorFlow / Keras Documentation', url: 'https://www.tensorflow.org/guide/keras' },
              { title: 'Deep Learning - Ian Goodfellow et al.', url: 'https://www.deeplearningbook.org/' },
              { title: 'Keras Sequential Model Guide', url: 'https://keras.io/guides/sequential_model/' },
              { title: 'Understanding Dropout Regularization', url: 'https://jmlr.org/papers/v15/srivastava14a.html' },
              { title: 'URL Feature Extraction for Phishing Detection', url: 'https://arxiv.org/abs/2002.07725' },
              { title: 'Adam Optimizer - Kingma & Ba (2014)', url: 'https://arxiv.org/abs/1412.6980' },
            ].map((ref, i) => (
              <ListItem key={i} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleOutlineIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link href={ref.url} target="_blank" rel="noopener" sx={{ color: 'secondary.light', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {ref.title}
                    </Link>
                  }
                  secondary={ref.url}
                  secondaryTypographyProps={{ sx: { color: 'text.secondary', fontSize: '0.7rem' } }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
