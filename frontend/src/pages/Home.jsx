import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BugReportIcon from '@mui/icons-material/BugReport';
import LinkIcon from '@mui/icons-material/Link';
import ShieldIcon from '@mui/icons-material/Shield';

const cards = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    title: 'Machine Learning Model',
    subtitle: 'อธิบายโมเดลตรวจจับ Malware',
    desc: 'Ensemble Learning ด้วย Random Forest, XGBoost และ Logistic Regression',
    path: '/ml-explanation',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
    title: 'Neural Network Model',
    subtitle: 'อธิบายโมเดลตรวจจับ URL อันตราย',
    desc: 'Deep Neural Network ด้วย Keras / TensorFlow',
    path: '/nn-explanation',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: <BugReportIcon sx={{ fontSize: 40 }} />,
    title: 'ตรวจจับ Malware',
    subtitle: 'ทดสอบอัพโหลดไฟล์',
    desc: 'อัพโหลดไฟล์ PE (.exe, .dll) เพื่อตรวจสอบว่าเป็น Malware หรือไม่',
    path: '/test-malware',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    icon: <LinkIcon sx={{ fontSize: 40 }} />,
    title: 'ตรวจจับ URL อันตราย',
    subtitle: 'ทดสอบป้อน URL',
    desc: 'ป้อน URL เพื่อตรวจสอบว่าอันตราย (Phishing/Malware) หรือปลอดภัย',
    path: '/test-url',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glow: 'rgba(245,158,11,0.3)',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Box
          sx={{
            width: 80, height: 80, borderRadius: 4, mx: 'auto', mb: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 0 60px rgba(59,130,246,0.3)',
          }}
        >
          <ShieldIcon sx={{ fontSize: 44, color: '#fff' }} />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mb: 2,
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #60a5fa)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shine 3s linear infinite',
            '@keyframes shine': {
              '0%': { backgroundPosition: '0% center' },
              '100%': { backgroundPosition: '200% center' },
            },
          }}
        >
          MALPHIS AI
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
          ระบบตรวจจับภัยคุกคามทางไซเบอร์ด้วย AI
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, opacity: 0.7 }}>
          Malware Detection & Phishing URL Identification System
        </Typography>
      </Box>

      {/* Cards */}
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} key={card.path}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.4s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: `0 0 40px ${card.glow}`,
                },
              }}
            >
              <CardActionArea onClick={() => navigate(card.path)} sx={{ height: '100%', p: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56, height: 56, borderRadius: 2.5, mb: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: card.gradient,
                      boxShadow: `0 0 20px ${card.glow}`,
                      color: '#fff',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {card.subtitle}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.7 }}>
                    {card.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
