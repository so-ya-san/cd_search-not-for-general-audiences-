import { useState } from 'react';
import cdList from './data/cd_list.json';
import './styles.css';
const SERVER_URL = 'https://cd-server.onrender.com';

function TrackSearch() {
    const [entryAuthorized, setEntryAuthorized] = useState(false);
    const [entryPasswordInput, setEntryPasswordInput] = useState('');
    const entryPassword = 'cd';

    const [query, setQuery] = useState('');
    const [artistQuery, setArtistQuery] = useState('');
    const [tracks, setTracks] = useState(cdList);
    const [newTrack, setNewTrack] = useState({ title: '', artist: '', location: '' });
    const [editIndex, setEditIndex] = useState(null);
    const [editTrack, setEditTrack] = useState({ title: '', artist: '', location: '' });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [requestingIndex, setRequestingIndex] = useState(null);
    const [nickname, setNickname] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [requests, setRequests] = useState([]);

    const correctPassword = 'cdpass2025';

    const filteredTracks = tracks.filter(
        (track) =>
            track.title.toLowerCase().includes(query.toLowerCase()) &&
            track.artist.toLowerCase().includes(artistQuery.toLowerCase())
    );

    const addTrack = async () => {
        if (!newTrack.title || !newTrack.artist || !newTrack.location) return;
        try {
            const res = await fetch(`${SERVER_URL}/api/addTrack`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTrack),
            });
            const data = await res.json();
            setTracks([...tracks, data.track]);
            setNewTrack({ title: '', artist: '', location: '' });
        } catch {
            alert('追加失敗');
        }
    };

    const deleteTrack = async (index) => {
        if (!window.confirm('削除してもよろしいですか？')) return;
        try {
            await fetch(`${SERVER_URL}/api/updateTrack/${editIndex}`, {                method: 'DELETE',
            });
            const updated = [...tracks];
            updated.splice(index, 1);
            setTracks(updated);
        } catch {
            alert('削除失敗');
        }
    };

    const startEdit = (index) => {
        setEditIndex(index);
        setEditTrack(tracks[index]);
    };

    const saveEdit = async () => {
        try {
            await fetch(`${SERVER_URL}/api/updateTrack/${editIndex}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editTrack),
            });
            const updated = [...tracks];
            updated[editIndex] = editTrack;
            setTracks(updated);
            setEditIndex(null);
            setEditTrack({ title: '', artist: '', location: '' });
        } catch {
            alert('編集失敗');
        }
    };

    const openRequestModal = (index) => {
        setRequestingIndex(index);
        setIsModalVisible(true);
    };

    const sendRequest = async () => {
        const track = tracks[requestingIndex];
        try {
            await fetch(`${SERVER_URL}/api/requestTrack`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, track }),
            });
            alert('📨 リクエストを送信しました！');
        } catch {
            alert('リクエスト失敗');
        } finally {
            setIsModalVisible(false);
            setNickname('');
        }
    };

    const fetchRequests = async () => {
        try {
            await fetch(`${SERVER_URL}/api/getRequests`)
            const data = await res.json();
            setRequests(data);
        } catch {
            alert('リクエスト一覧取得失敗');
        }
    };

    const handlePassword = () => {
        if (passwordInput === correctPassword) {
            setIsAuthenticated(true);
            fetchRequests();
            alert('✅ 管理モードに入りました');
        } else {
            alert('❌ パスワードが違います');
        }
    };

    // 🟦 アプリ全体のパスワード制御
    if (!entryAuthorized) {
        return (
            <div style={{
                padding: 32,
                maxWidth: 400,
                margin: '40px auto',
                backgroundColor: '#202938',
                color: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
                <h2>🔐 CD検索ツールへアクセス</h2>
                <input
                    type="password"
                    value={entryPasswordInput}
                    onChange={(e) => setEntryPasswordInput(e.target.value)}
                    placeholder="使用パスワード"
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        boxSizing: 'border-box'  // ✅これが重要！
                    }}
         />
                <button
                    onClick={() => {
                        if (entryPasswordInput === entryPassword) {
                            setEntryAuthorized(true);
                        } else {
                            alert('❌ パスワードが違います');
                        }
                    }}
                    style={{ width: '100%', padding: 10, backgroundColor: '#4a6a80', color: '#fff', border: 'none', borderRadius: 6 }}
                >
                    入る
                </button>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: 700,
            //margin: '0 auto',               // ✅ 横中央揃えの決定打！
            marginright: 'auto',
            marginleft: 'auto',
            padding: '32px',
            backgroundColor: '#202938',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            color: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
         }}>
            <h1>CD曲名・アーティスト検索＆管理ツール</h1>

            <input
                placeholder="曲名で検索"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <input
                placeholder="アーティストで検索"
                value={artistQuery}
                onChange={(e) => setArtistQuery(e.target.value)}
                style={{ width: '100%', padding: 8, marginBottom: 16 }}
            />

            {(query || artistQuery) ? (
                filteredTracks.map((track, index) => (
                    <div key={index} style={{
                        width: '100%',
                        maxWidth: 600,
                        margin: '0 auto',           
                        backgroundColor: '#384250',
                        borderRadius: 6,
                        padding: 32,
                        marginBottom: 8
                    }}>
                        {editIndex === index ? (
                            <>
                                <input
                                    value={editTrack.title}
                                    onChange={(e) => setEditTrack({ ...editTrack, title: e.target.value })}
                                    placeholder="曲名"
                                    style={{ width: '100%', marginBottom: 4 }}
                                />
                                <input
                                    value={editTrack.artist}
                                    onChange={(e) => setEditTrack({ ...editTrack, artist: e.target.value })}
                                    placeholder="アーティスト"
                                    style={{ width: '100%', marginBottom: 4 }}
                                />
                                <input
                                    value={editTrack.location}
                                    onChange={(e) => setEditTrack({ ...editTrack, location: e.target.value })}
                                    placeholder="保管場所"
                                    style={{ width: '100%', marginBottom: 4 }}
                                />
                                <button onClick={saveEdit}>保存</button>
                            </>
                        ) : (
                            <>
                                <div>{"🎵 "}{track.title}</div>
                                <div>{"🎤 "}{track.artist}</div>
                                <div>{"📍 "}{track.location}</div>
                                {isAuthenticated && (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        <button onClick={() => startEdit(index)}>編集</button>
                                        <button onClick={() => deleteTrack(index)}>削除</button>
                                    </div>
                                )}
                                <button
                                    onClick={() => openRequestModal(index)}
                                    style={{ marginTop: 4 }}
                                >
                                    リクエスト
                                </button>
                            </>
                        )}
                    </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', color: '#4a6a80', marginTop: 24 }}>
                    🔍 曲名またはアーティスト名で検索してください
                </div>
            )}
            {/* 追加フォーム */}
            <div style={{ borderTop: '1px solid #ccc', marginTop: 24, paddingTop: 16 }}>
                <h2>曲を追加</h2>
                <input
                    placeholder="曲名"
                    value={newTrack.title}
                    onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                    style={{ width: '100%', marginBottom: 8 }}
                />
                <input
                    placeholder="アーティスト"
                    value={newTrack.artist}
                    onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
                    style={{ width: '100%', marginBottom: 8 }}
                />
                <input
                    placeholder="保管場所"
                    value={newTrack.location}
                    onChange={(e) => setNewTrack({ ...newTrack, location: e.target.value })}
                    style={{ width: '100%', marginBottom: 8 }}
                />
                <button
                    onClick={addTrack}
                    style={{
                        width: '100%',
                        padding: 10,
                        backgroundColor: '#4a6a80',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6
                    }}
                >
                    追加する
                </button>
            </div>

            {/* パスワード入力（編集モード用） */}
            <div style={{ borderTop: '1px dashed #aaa', marginTop: 32, paddingTop: 16 }}>
                <h2>🔐 編集モードに入るにはパスワード</h2>
                <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="パスワード"
                    style={{ width: '100%', marginBottom: 8, padding: 8 }}
                />
                <button
                    onClick={handlePassword}
                    style={{
                        width: '100%',
                        padding: 10,
                        backgroundColor: '#4a6a80',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6
                    }}
                >
                    認証する
                </button>
            </div>

            {/* 管理者のみ表示：リクエスト一覧 */}
            {isAuthenticated && (
                <div style={{ marginTop: 32 }}>
                    <h3>📨 リクエスト一覧</h3>
                    {requests.map((req, i) => (
                        <div key={i} style={{ borderBottom: '1px dashed #ccc', padding: 4 }}>
                            🧑 {req.nickname}<br />
                            🎵 {req.track.title} / 🎤 {req.track.artist}
                        </div>
                    ))}
                </div>
            )}

            {/* モーダル（ニックネーム入力） */}
            {isModalVisible && (
                <div
                    className="modal-overlay"
                    onClick={() => setIsModalVisible(false)} // モーダル外クリックで閉じる
                    style={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 999
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()} // 中身のクリックは閉じない
                        style={{
                            backgroundColor: '#202938',
                            padding: 24,
                            borderRadius: 8,
                            width: '90%',
                            maxWidth: 400,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            textAlign: 'center'
                        }}
                    >
                        <h3>ニックネームを入力してください</h3>
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="ニックネーム"
                            style={{
                                width: '100%',
                                padding: 10,
                                marginBottom: 12,
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            onClick={sendRequest}
                            style={{
                                width: '100%',
                                padding: 10,
                                backgroundColor: '#4a6a80',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                cursor: 'pointer'
                            }}
                        >
                            リクエストする！
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


export default TrackSearch;
