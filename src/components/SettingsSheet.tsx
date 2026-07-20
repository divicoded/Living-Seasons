import { useState } from 'react';
import Sheet from '@mui/joy/Sheet';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Switch from '@mui/joy/Switch';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';
import { IoSettingsOutline } from 'react-icons/io5';
import { useStore } from '../store/useStore';
import { useFeedback } from '../hooks/useFeedback';
import './settings.css';

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="set-row">
      <div className="set-row-text">
        <span className="set-label">{label}</span>
        {desc && <span className="set-desc">{desc}</span>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsSheet() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const { settings, updateSettings, name, setName, tagline, setTagline } = useStore();
  const { feedback } = useFeedback();
  const s = settings;

  const openMenu = () => {
    setClosing(false);
    setOpen(true);
    feedback('open', [10, 30, 10]);
  };
  const closeMenu = () => {
    setClosing(true);
    setOpen(false);
    feedback('close', [10, 20]);
    // Clear the closing class after the animation so it can replay next time.
    window.setTimeout(() => setClosing(false), 420);
  };

  // Keep wheel/touch scrolling inside the sheet from being swallowed by the
  // page's smooth-scroll layer. The sheet scrolls natively.
  const stopScroll = (e: React.WheelEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <IconButton
        className={`set-fab ${open ? 'open' : ''} ${closing ? 'closing' : ''}`}
        onClick={openMenu}
        aria-label="Settings"
        aria-expanded={open}
      >
        <IoSettingsOutline size={22} className="set-fab-icon" />
      </IconButton>

      <Modal open={open} onClose={closeMenu} className="set-modal">
        <Sheet
          className="set-sheet glass"
          onWheel={stopScroll}
          onTouchMove={stopScroll}
          onTouchStart={stopScroll}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Typography level="h4" className="set-title">Settings</Typography>

          <div className="set-section">
            <span className="set-section-title">Identity</span>
            <Row label="Your name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value || 'Friend')}
                size="sm"
                sx={{ width: 140 }}
              />
            </Row>
            <Row label="Tagline">
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                size="sm"
                sx={{ width: 160 }}
              />
            </Row>
          </div>

          <div className="set-section">
            <span className="set-section-title">Experience</span>
            <Row label="Ambient particles" desc="Seasonal drift"><Switch checked={s.particles} onChange={(e) => updateSettings({ particles: e.target.checked })} /></Row>
            <Row label="Motion & animation" desc="Entrances & parallax"><Switch checked={s.motion} onChange={(e) => updateSettings({ motion: e.target.checked })} /></Row>
            <Row label="Background blur" desc="Depth of field"><Switch checked={s.blur} onChange={(e) => updateSettings({ blur: e.target.checked })} /></Row>
            <Row label="Dynamic color" desc="Material You palette"><Switch checked={s.dynamicColor} onChange={(e) => updateSettings({ dynamicColor: e.target.checked })} /></Row>
            <Row label="Performance mode" desc="Disable postprocessing"><Switch checked={s.perfMode} onChange={(e) => updateSettings({ perfMode: e.target.checked })} /></Row>
            <Row label="Sound" desc="Ambient audio (muted)"><Switch checked={s.sound} onChange={(e) => updateSettings({ sound: e.target.checked })} /></Row>
            <Row label="Haptics" desc="Vibration feedback"><Switch checked={s.haptics} onChange={(e) => updateSettings({ haptics: e.target.checked })} /></Row>
          </div>
        </Sheet>
      </Modal>
    </>
  );
}
