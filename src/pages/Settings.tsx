import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/uiStore';
import { db } from '../db/db';
import { exportData, importData } from '../utils/dataHelper';
import { Download, Upload, Save } from 'lucide-react';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const { theme, setTheme, currency, setCurrency, merchantUpiId, setMerchantUpiId } = useUIStore();

    const [storeName, setStoreName] = useState('My Local Shop');
    const [storeAddress, setStoreAddress] = useState('123 Main St');
    const [taxRate, setTaxRate] = useState(0);
    const [upiId, setUpiId] = useState(merchantUpiId);

    useEffect(() => {
        const loadSettings = async () => {
            const settingsTable = await db.settings.toArray();
            if (settingsTable.length > 0) {
                const s = settingsTable[0];
                setStoreName(s.storeName);
                setStoreAddress(s.storeAddress);
                setTaxRate(s.taxRate);
                if (s.merchantUpiId !== undefined) {
                    setUpiId(s.merchantUpiId);
                    if (s.merchantUpiId !== merchantUpiId) {
                        setMerchantUpiId(s.merchantUpiId);
                    }
                }
                if (s.currency && s.currency !== currency) {
                    setCurrency(s.currency);
                }
                if (s.language !== i18n.language) {
                    i18n.changeLanguage(s.language);
                }
            }
        };
        loadSettings();
    }, [i18n]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await db.settings.clear();
            await db.settings.add({
                theme,
                taxRate,
                currency,
                language: i18n.language,
                storeName,
                storeAddress,
                merchantUpiId: upiId
            });
            setMerchantUpiId(upiId);
            alert(t('common.success'));
        } catch (err) {
            console.error(err);
            alert(t('common.error'));
        }
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    return (
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h2 className="text-xl font-bold mb-4 border-b border-border pb-2">Application Preferences</h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('settings.theme')}</label>
                            <select
                                value={theme}
                                onChange={e => setTheme(e.target.value as 'light' | 'dark')}
                                className="w-full p-2 rounded-md border border-input bg-background"
                            >
                                <option value="light">{t('settings.light')}</option>
                                <option value="dark">{t('settings.dark')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">{t('settings.language')}</label>
                            <select
                                value={i18n.language}
                                onChange={e => handleLanguageChange(e.target.value)}
                                className="w-full p-2 rounded-md border border-input bg-background"
                            >
                                <option value="en">English</option>
                                <option value="ta">தமிழ் (Tamil)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Currency</label>
                            <select
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                className="w-full p-2 rounded-md border border-input bg-background"
                            >
                                <option value="₹">₹ (INR)</option>
                                <option value="$">$ (USD)</option>
                                <option value="€">€ (EUR)</option>
                                <option value="£">£ (GBP)</option>
                                <option value="¥">¥ (JPY)</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-border mt-4">
                            <h3 className="text-lg font-bold mb-3">Store Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('settings.storeName')}</label>
                                    <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full p-2 rounded-md border border-input bg-background" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('settings.storeAddress')}</label>
                                    <textarea value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className="w-full p-2 rounded-md border border-input bg-background" rows={3}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('settings.taxRate')}</label>
                                    <input type="number" min="0" step="0.1" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full p-2 rounded-md border border-input bg-background" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Merchant UPI ID</label>
                                    <input
                                        type="text"
                                        placeholder="yourshop@upi"
                                        value={upiId}
                                        onChange={e => setUpiId(e.target.value)}
                                        className="w-full p-2 rounded-md border border-input bg-background"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Required for accepting UPI payments via QR code</p>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-bold flex justify-center items-center gap-2 mt-6">
                            <Save size={20} />
                            {t('settings.save')}
                        </button>
                    </form>
                </div>

                <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                    <h2 className="text-xl font-bold mb-4 border-b border-border pb-2">Data Management</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Backup your database locally to a JSON file. This includes all your products, categories, sales history, and settings.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={exportData}
                            className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded-lg font-bold border border-border"
                        >
                            <Download size={20} />
                            Backup Database (Export)
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                id="import-upload"
                                className="hidden"
                                onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        if (confirm("Warning: Importing data will replace your current database completely. Are you sure?")) {
                                            try {
                                                await importData(e.target.files[0]);
                                                alert(t('common.success'));
                                                window.location.reload();
                                            } catch (err) {
                                                alert(t('common.error'));
                                            }
                                        }
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <label
                                htmlFor="import-upload"
                                className="w-full flex items-center justify-center gap-2 cursor-pointer bg-destructive hover:bg-destructive/90 text-destructive-foreground py-3 rounded-lg font-bold"
                            >
                                <Upload size={20} />
                                Restore Database (Import)
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
