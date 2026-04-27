import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { CloudUpload, CloudDownload, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const CloudSync = ({
  decks,
  questions,
  rawTexts,
  onImportData,
  showToast,
  onActionComplete,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const tokenClientRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is missing in .env file');
    }

    const initGoogleClient = () => {
      if (!globalThis.google?.accounts) return;

      tokenClientRef.current = globalThis.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        callback: () => {},
      });
    };

    const existingScript = document.getElementById('google-gsi-client');

    if (existingScript) {
      if (globalThis.google?.accounts) {
        initGoogleClient();
      } else {
        existingScript.addEventListener('load', initGoogleClient);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogleClient;

    document.body.appendChild(script);

    return () => {
      if (existingScript) existingScript.removeEventListener('load', initGoogleClient);
    };
  }, []);

  const handleAuth = (actionCallback) => {
    if (!tokenClientRef.current) {
      showToast('Google Drive module is not loaded yet. Please wait a second.', 'error');
      return;
    }

    tokenClientRef.current.callback = async (response) => {
      if (response.error) {
        showToast('Google authentication failed or was cancelled.', 'error');
        return;
      }

      setIsSyncing(true);
      await actionCallback(response.access_token);
      setIsSyncing(false);

      setTimeout(() => {
        if (onActionComplete) onActionComplete();
      }, 800);
    };

    tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
  };

  const getAppDataFileId = async (accessToken) => {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name="quiz-forge-cloud-sync.json"',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  };

  const uploadToDrive = async (accessToken) => {
    try {
      showToast('Saving to Google Drive...', 'info');
      const fileId = await getAppDataFileId(accessToken);
      const method = fileId ? 'PATCH' : 'POST';
      const url = fileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const metadata = {
        name: 'quiz-forge-cloud-sync.json',
        parents: fileId ? undefined : ['appDataFolder'],
      };

      const fileContent = JSON.stringify({ decks, questions, rawTexts });
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });

      if (response.ok) {
        showToast('Backup successfully saved to Google Drive!', 'success');
      } else {
        throw new Error('Upload failed with status: ' + response.status);
      }
    } catch (error) {
      console.error('Drive Upload Error:', error);
      showToast('Error while saving to Cloud. Check console.', 'error');
    }
  };

  const downloadFromDrive = async (accessToken) => {
    try {
      showToast('Searching for Cloud backups...', 'info');
      const fileId = await getAppDataFileId(accessToken);
      if (!fileId) {
        showToast('No backups found on your Google Drive.', 'error');
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.decks && data.questions) {
          onImportData(data);
          showToast('Data successfully restored from the Cloud!', 'success');
        } else {
          showToast('The file in the Cloud appears to be corrupted.', 'error');
        }
      } else {
        throw new Error('Download failed with status: ' + response.status);
      }
    } catch (error) {
      console.error('Drive Download Error:', error);
      showToast('Error while restoring from Cloud. Check console.', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full">
      <button
        onClick={() => handleAuth(uploadToDrive)}
        disabled={isSyncing}
        className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Save backup to Google Drive"
      >
        {isSyncing ? (
          <Loader2 className="w-4 h-4 mr-2.5 animate-spin text-indigo-500" />
        ) : (
          <CloudUpload className="w-4 h-4 mr-2.5 text-indigo-500 group-hover:scale-110 transition-transform" />
        )}
        Save to Google Drive
      </button>

      <button
        onClick={() => handleAuth(downloadFromDrive)}
        disabled={isSyncing}
        className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Restore from Google Drive"
      >
        {isSyncing ? (
          <Loader2 className="w-4 h-4 mr-2.5 animate-spin text-indigo-500" />
        ) : (
          <CloudDownload className="w-4 h-4 mr-2.5 text-indigo-500 group-hover:scale-110 transition-transform" />
        )}
        Restore from Google Drive
      </button>
    </div>
  );
};

CloudSync.propTypes = {
  decks: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired,
  rawTexts: PropTypes.object.isRequired,
  onImportData: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  onActionComplete: PropTypes.func,
};
