import { AppBar, Box, Container, IconButton, InputAdornment, Tab, Tabs, TextField, Toolbar, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useLocation, useNavigate } from 'react-router-dom';
import { MAIN_TABS } from '@src/app/navigation';


export default function HeaderBar({ q, setQ }: { q: string; setQ: (v: string) => void }) {
    const loc = useLocation();
    const nav = useNavigate();
    const currentIdx = Math.max(0, MAIN_TABS.findIndex(t => (t.path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(t.path))));
    const mode = document.documentElement.classList.contains('mui-dark') ? 'dark' : 'light';


    return (
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'saturate(180%) blur(8px)', borderBottom: 1, borderColor: 'divider' }}>
            <Container>
                <Toolbar disableGutters sx={{ gap: 2, py: 1.5 }}>
                    <Box sx={{ fontWeight: 600, mr: 1 }}>YaYin</Box>
                    <Tabs value={currentIdx} onChange={(_, i) => nav(MAIN_TABS[i].path)} sx={{ minHeight: 0, '& .MuiTab-root': { minHeight: 0 } }}>
                        {MAIN_TABS.map(t => <Tab key={t.id} label={t.title} />)}
                    </Tabs>
                    <Box sx={{ flex: 1 }} />
                    <TextField
                        size="small"
                        placeholder="Search char / 雅音 / 老國音 / 注音 / 拼音"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                        sx={{ width: { xs: 240, md: 360 } }}
                    />
                    <Tooltip title="Toggle theme">
                        <IconButton onClick={() => (window as any).__setThemeMode?.(document.documentElement.classList.contains('mui-dark') ? 'light' : 'dark')}>
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </Container>
        </AppBar>
    );
}