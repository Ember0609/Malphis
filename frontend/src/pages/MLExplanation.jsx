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
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
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
    background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
    zIndex: -1,
    filter: 'blur(20px)',
  },
};

export default function MLExplanation() {
  const features = [
    'Machine', 'NumberOfSections', 'Characteristics', 'Magic',
    'SizeOfCode', 'SizeOfInitializedData', 'SizeOfUninitializedData',
    'AddressOfEntryPoint', 'BaseOfCode', 'SectionAlignment', 'FileAlignment',
    'MajorSubsystemVersion', 'SizeOfHeaders', 'Subsystem', 'DllCharacteristics',
    'SizeOfStackReserve', 'SizeOfHeapReserve', 'LoaderFlags',
    'SectionMinEntropy', 'SectionMaxEntropy', 'SectionMaxRawsize', 'SectionMaxVirtualsize'
  ];

  const steps = [
    {
      label: 'โหลดและคัดกรองข้อมูล',
      desc: 'นำเข้าข้อมูลไฟล์ PE 19,611 รายการจาก dataset_malwares.csv',
    },
    {
      label: 'เลือก Robust Features',
      desc: 'สกัดเอาเฉพาะโครงสร้างเชิงลึก (22 Features) ที่ถูกแปรผันยากที่สุด เช่น เอนโทรปี, DllCharacteristics, ลักษณะโค้ด',
    },
    {
      label: 'ปรับสเกลข้อมูล (Scaling)',
      desc: 'ใช้ StandardScaler แปลงคุณลักษณะทุกมิติให้อยู่ในสเกลที่สมดุลและลดผลกระทบจากค่าโดด (Outliers)',
    },
    {
      label: 'แบ่งชุดทดสอบ (Train/Test)',
      desc: 'คัดแยกข้อมูลเป็น 80% สำหรับฝึก AI และ 20% สำหรับวัดความก้าวหน้า',
    },
    {
      label: 'ประมวลผลด้วย Ensemble AI',
      desc: 'สร้าง Voting Classifier ผสานโมเดลท็อปคลาส (XGBoost, Random Forest, GBDT) แบบ Soft Voting',
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
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 0 30px rgba(59,130,246,0.3)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 30, color: '#fff' }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Machine Learning Model
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ระบบตรวจจับ Malware ด้วย Ensemble Learning
            </Typography>
          </Box>
        </Box>
        <Chip label="Ensemble Voting" size="small" sx={{ mr: 1, bgcolor: 'rgba(59,130,246,0.15)', color: 'primary.light' }} />
        <Chip label="Random Forest" size="small" sx={{ mr: 1, bgcolor: 'rgba(139,92,246,0.15)', color: 'secondary.light' }} />
        <Chip label="XGBoost" size="small" sx={{ mr: 1, bgcolor: 'rgba(16,185,129,0.15)', color: 'success.light' }} />
        <Chip label="Gradient Boosting" size="small" sx={{ bgcolor: 'rgba(244,63,94,0.15)', color: '#fb7185' }} />
      </Box>

      {/* 1. Data Preparation */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <StorageIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5">1. การเตรียมข้อมูล (Dataset Selection)</Typography>
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            ใช้ชุดข้อมูล <Link href="https://www.kaggle.com/datasets/amauricio/pe-files-malwares?select=dataset_malwares.csv" target="_blank" rel="noopener noreferrer" sx={{ color: '#60a5fa', fontWeight: 'bold', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>dataset_malwares.csv</Link> 
            ทำการสกัด Features โครงสร้าง (Robust Features) และกำหนด Label เป็น 1=Malware, 0=Benign
          </Typography>

          <Typography variant="subtitle2" sx={{ color: 'primary.light', mb: 2 }}>
            <DatasetIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Features ที่ใช้ฝึกสอน ({features.length} คุณลักษณะเชิงลึก):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {features.map((f) => (
              <Chip
                key={f}
                label={f}
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(59,130,246,0.3)', color: 'text.secondary', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* 2. Feature Engineering & Preprocessing */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <TuneIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5">2. Feature Engineering & Preprocessing</Typography>
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            ก่อนนำข้อมูลเข้าสู่โมเดล ข้อมูลดิบจะต้องผ่านกระบวนการแปลงและทำความสะอาดให้อยู่ในรูปแบบที่อัลกอริทึมสามารถเรียนรู้ได้อย่างมีประสิทธิภาพที่สุด (Data Transformation):
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#60a5fa', mb: 0.5 }}>
                🧩 Structural Entropy Analysis (การวิเคราะห์ความยุ่งเหยิง)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                คำนวณระดับค่าเอนโทรปี (Entropy/Packing Density) ออกมาจากแต่ละ Section ข้อมูลในไฟล์ PE
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#a78bfa', mb: 0.5 }}>
                🛡️ Signature Override
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                ตรวจสอบการมีอยู่ของ Authenticode Digital Signature และรายชื่อ Whitelist ร่วมกับผลลัพธ์ของโมเดล
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#34d399', mb: 0.5 }}>
                📏 Feature Scaling
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                ใช้ <code>StandardScaler</code> นำข้อมูลที่สกัดได้ไปปรับสเกลให้ได้ระยะมาตรฐาน (Z-Score)
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 3. Algorithm Theory */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <AutoFixHighIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5">3. หลักการทำงานของโมเดล (How the Model Works)</Typography>
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            ใช้ <strong style={{ color: '#60a5fa' }}>Ensemble Learning</strong> ประเภท Voting Classifier (Soft Voting) จาก 3 โมเดลย่อย:
          </Typography>

          <Divider sx={{ borderColor: 'rgba(59,130,246,0.1)', my: 3 }} />

          {/* Sub-models */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#60a5fa', mb: 1, fontSize: '1rem' }}>
                🌲 Random Forest Classifier
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                ใช้ 100 ต้น (n_estimators=100) ทำงานครอบกับ Bootstrap Sampling และ Majority Voting
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#a78bfa', mb: 1, fontSize: '1rem' }}>
                ⚡ XGBClassifier
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                จำนวน 100 ต้น กำหนดพารามิเตอร์ eval_metric='logloss'
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#fb7185', mb: 1, fontSize: '1rem' }}>
                📉 GradientBoostingClassifier
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                จำนวน 100 ต้น เป็นองค์ประกอบร่วมแบบ Boosting ในกระบวนการ Ensemble
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 4. Development Steps */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <AccountTreeIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5">4. ขั้นตอนการพัฒนาโมเดล</Typography>
          </Box>

          <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { borderColor: 'rgba(59,130,246,0.3)' } }}>
            {steps.map((step, i) => (
              <Step key={i} active expanded>
                <StepLabel
                  StepIconProps={{
                    sx: { color: 'primary.main', '&.Mui-active': { color: 'primary.main' } },
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

          <Divider sx={{ borderColor: 'rgba(59,130,246,0.1)', my: 3 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TuneIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ color: 'primary.light' }}>Hyperparameters</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {[
              { k: 'Random Forest n_estimators', v: '100' },
              { k: 'XGBoost n_estimators', v: '100' },
              { k: 'XGBoost eval_metric', v: 'logloss' },
              { k: 'Gradient Boosting n_estimators', v: '100' },
              { k: 'Voting', v: 'Soft' },
              { k: 'Test Size', v: '20%' },
              { k: 'Dataset Status', v: 'dataset_malwares.csv (19k Files)' },
            ].map((p) => (
              <Box key={p.k} sx={{ p: 1.5, bgcolor: 'rgba(59,130,246,0.05)', borderRadius: 2, border: '1px solid rgba(59,130,246,0.1)' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{p.k}</Typography>
                <Typography variant="body2" sx={{ color: 'primary.light', fontWeight: 600 }}>{p.v}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box >
  );
}
