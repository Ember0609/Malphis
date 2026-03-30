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
    'Machine', 'DebugSize', 'DebugRVA', 'MajorImageVersion',
    'MajorOSVersion', 'ExportRVA', 'ExportSize', 'IatVRA',
    'MajorLinkerVersion', 'MinorLinkerVersion', 'NumberOfSections',
    'SizeOfStackReserve', 'DllCharacteristics', 'ResourceSize', 'BitcoinAddresses',
  ];

  const steps = [
    {
      label: 'โหลดและทำความสะอาดข้อมูล',
      desc: 'อ่านข้อมูลจาก Malware.csv และลบข้อมูลที่ซ้ำกัน (drop_duplicates)',
    },
    {
      label: 'แยก Features และ Label',
      desc: 'ลบคอลัมน์ FileName, md5Hash, Status ออกเป็น Features (X) และ Map ค่า Status เป็น 0=Malware, 1=Benign สำหรับ Label (y)',
    },
    {
      label: 'จัดการค่าที่หายไป (Imputation)',
      desc: 'ใช้ SimpleImputer ด้วย strategy="median" เพื่อแทนค่า NaN ด้วยค่ามัธยฐาน',
    },
    {
      label: 'แบ่งชุดข้อมูล Train / Test',
      desc: 'แบ่งข้อมูล 80:20 ด้วย train_test_split (random_state=42)',
    },
    {
      label: 'ปรับสเกลข้อมูล (Scaling)',
      desc: 'ใช้ StandardScaler เพื่อแปลงข้อมูลให้มี mean=0 และ std=1',
    },
    {
      label: 'สร้างโมเดล Ensemble',
      desc: 'สร้าง VotingClassifier แบบ soft voting จาก 3 อัลกอริทึม: Random Forest, XGBoost และ Logistic Regression',
    },
    {
      label: 'ฝึกสอนและบันทึกโมเดล',
      desc: 'Train โมเดลและบันทึกไฟล์ .pkl ด้วย joblib สำหรับ model, scaler และ imputer',
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
        <Chip label="Logistic Regression" size="small" sx={{ bgcolor: 'rgba(244,63,94,0.15)', color: '#fb7185' }} />
      </Box>

      {/* 1. Data Preparation */}
      <Card sx={{ ...glowBox, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <StorageIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5">1. การเตรียมข้อมูล (Data Preparation)</Typography>
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
            ใช้ชุดข้อมูล <strong style={{ color: '#60a5fa' }}>Malware.csv</strong> ซึ่งประกอบด้วยข้อมูลคุณลักษณะ (Features) จากไฟล์ PE (Portable Executable)
            เช่น .exe และ .dll โดยข้อมูลแต่ละแถวมี Label เป็น "Malware" หรือ "Benign"
            ข้อมูลถูกแปลงเป็นรูปแบบตัวเลข (0=Malware, 1=Benign) สำหรับการฝึกสอนโมเดล
          </Typography>

          <Typography variant="subtitle2" sx={{ color: 'primary.light', mb: 2 }}>
            <DatasetIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Features ที่ใช้ ({features.length} คุณลักษณะ):
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

          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
            ขั้นตอนการเตรียมข้อมูล: ลบข้อมูลซ้ำ → แทนค่าที่หายไปด้วยค่ามัธยฐาน (Median Imputation) →
            แบ่งข้อมูล 80% Train / 20% Test → ปรับสเกลด้วย StandardScaler (Z-score Normalization)
          </Typography>
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
                🔄 Label Encoding (การแปลงตัวแปรเป้าหมาย)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                แปลงคลาสผลลัพธ์ที่เป็นข้อความให้เป็นตัวเลข เช่น "Malware" ถูกแปลงเป็น 0 และ "Benign" ถูกแปลงเป็น 1 เพื่อให้คณิตศาสตร์ในโมเดลประมวลผลได้
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#a78bfa', mb: 0.5 }}>
                🩹 Median Imputation (การจัดการข้อมูลสูญหาย)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                ในกรณีที่ไฟล์ PE บางไฟล์มีฟีเจอร์บางตัวสกัดออกมาไม่ได้หรือเป็นค่าว่าง (NaN) เราใช้ <code>SimpleImputer(strategy='median')</code> 
                เพื่อเติมค่าที่หายไปด้วย "ค่ามัธยฐาน" ของข้อมูลคอลัมน์นั้นๆ ซึ่งมีข้อดีคือทนทานต่อค่าผิดปกติ (Outliers) ได้ดีกว่าการเติมด้วยค่าเฉลี่ย
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#34d399', mb: 0.5 }}>
                📏 Feature Scaling (การปรับพื้นที่สเกล)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                เนื่องจากค่าของแต่ละ Feature ใน PE File มีหน่วยและขนาดห่างกันมาก (เช่น SizeOfStackReserve มีค่าเป็นล้าน แต่ NumberOfSections มีค่าหลักสิบ)
                เราจึงใช้ <code>StandardScaler</code> หรือ Z-score Normalization ปรับให้ทุก Feature มีช่วงที่เท่าเทียมกัน (Mean=0, SD=1)
                เพื่อให้โมเดลเรียนรู้ความสำคัญของแต่ละฟีเจอร์ได้อย่างสมดุล และไม่เอนเอียงไปลดความสำคัญของฟีเจอร์ที่มีค่าน้อย
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
            ใช้เทคนิค <strong style={{ color: '#60a5fa' }}>Ensemble Learning</strong> แบบ Voting Classifier (Soft Voting)
            ซึ่งรวมการพยากรณ์จากหลายโมเดลเข้าด้วยกัน โดยใช้ค่าความน่าจะเป็นเฉลี่ยในการตัดสินผลลัพธ์สุดท้าย
            ทำให้ได้ผลลัพธ์ที่แม่นยำกว่าการใช้โมเดลเดี่ยว
          </Typography>

          <Divider sx={{ borderColor: 'rgba(59,130,246,0.1)', my: 3 }} />

          {/* Sub-models */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#60a5fa', mb: 1, fontSize: '1rem' }}>
                🌲 Random Forest Classifier
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                สร้าง Decision Tree จำนวน 100 ต้น แต่ละต้นเรียนรู้จากข้อมูลที่สุ่มมา (Bootstrap Sampling)
                และสุ่มเลือก Features เพื่อลดปัญหา Overfitting ผลลัพธ์สุดท้ายใช้วิธี Majority Voting จากทุกต้นไม้
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#a78bfa', mb: 1, fontSize: '1rem' }}>
                ⚡ XGBoost (Extreme Gradient Boosting)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                อัลกอริทึมแบบ Gradient Boosting ที่สร้าง Decision Trees ต่อเนื่องกัน 100 ต้น
                โดยต้นไม้แต่ละต้นจะเรียนรู้จาก "ข้อผิดพลาด" ของต้นก่อนหน้า ใช้ Regularization เพื่อป้องกัน Overfitting
                และ eval_metric='logloss' สำหรับวัดประสิทธิภาพ
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#fb7185', mb: 1, fontSize: '1rem' }}>
                📈 Logistic Regression
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                อัลกอริทึมเชิงเส้นที่ใช้ Sigmoid Function แปลงผลลัพธ์เป็นค่าความน่าจะเป็น (0-1)
                เหมาะสำหรับปัญหา Binary Classification ตั้งค่า max_iter=1000 เพื่อให้ Convergence ได้อย่างสมบูรณ์
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
              { k: 'LogReg max_iter', v: '1000' },
              { k: 'Voting', v: 'Soft' },
              { k: 'Test Size', v: '20%' },
            ].map((p) => (
              <Box key={p.k} sx={{ p: 1.5, bgcolor: 'rgba(59,130,246,0.05)', borderRadius: 2, border: '1px solid rgba(59,130,246,0.1)' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{p.k}</Typography>
                <Typography variant="body2" sx={{ color: 'primary.light', fontWeight: 600 }}>{p.v}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
