import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Subscription from '../payment/Subscription';

const Dashboard = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState('transcribe');
  const [videoUrl, setVideoUrl] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es'); // Spanish as default
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user's videos
    const getUserVideos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/api/videos', {
            headers: {
              'x-auth-token': token
            }
          });
          setVideos(res.data);
        }
      } catch (err) {
        console.error(err.response.data);
      }
    };

    getUserVideos();
  }, []);

  const handleProcessVideo = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      let res;

      if (activeTab === 'transcribe') {
        res = await api.post('/api/videos/transcribe', { videoUrl }, {
          headers: {
            'x-auth-token': token
          }
        });
      } else if (activeTab === 'translate') {
        res = await api.post('/api/videos/translate', { videoUrl, targetLanguage }, {
          headers: {
            'x-auth-token': token
          }
        });
      }

      // Refresh videos list
      const videosRes = await api.get('/api/videos', {
        headers: {
          'x-auth-token': token
        }
      });
      setVideos(videosRes.data);
      
      setVideoUrl('');
    } catch (err) {
      console.error(err.response.data);
      alert('Error processing video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {user && (
        <div className="user-info card">
          <h2>Welcome, {user.name}!</h2>
          <p>Email: {user.email}</p>
          <p>Credits: {user.credits}</p>
          <p>Subscription: {user.subscription}</p>
        </div>
      )}

      <Subscription />

      <div className="video-process card">
        <div className="tabs">
          <button 
            className={activeTab === 'transcribe' ? 'active' : ''} 
            onClick={() => setActiveTab('transcribe')}
          >
            Transcribe
          </button>
          <button 
            className={activeTab === 'translate' ? 'active' : ''} 
            onClick={() => setActiveTab('translate')}
          >
            Translate
          </button>
        </div>

        <form onSubmit={handleProcessVideo}>
          <div className="form-group">
            <label>Video/Audio URL:</label>
            <input
              type="text"
              placeholder="Enter URL to video or audio file"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
          </div>

          {activeTab === 'translate' && (
            <div className="form-group">
              <label>Target Language:</label>
              <select 
                value={targetLanguage} 
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : `Start ${activeTab === 'transcribe' ? 'Transcription' : 'Translation'}`}
          </button>
        </form>
      </div>

      <div className="video-history card">
        <h2>Your Video Processing History</h2>
        {videos.length > 0 ? (
          <table className="video-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(video => (
                <tr key={video._id}>
                  <td>{video.title}</td>
                  <td>{video.type}</td>
                  <td>
                    <span className={`status ${video.status}`}>
                      {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(video.date).toLocaleDateString()}</td>
                  <td>
                    {video.processedUrl && (
                      <a href={video.processedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                        View Result
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No processing history yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;