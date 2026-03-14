// This utility is deprecated as the app has moved to Supabase cloud.
// Local export/import logic currently disabled.

export const exportData = async () => {
    console.warn("Local export is deprecated. Use Supabase dashboard for data management.");
    alert("Local export is no longer supported after the cloud migration. Your data is securely stored in Supabase.");
};

export const importData = async (_file: File) => {
    console.warn("Local import is deprecated.");
    alert("Local import is no longer supported. Please use the cloud interface.");
};
