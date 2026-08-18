'use client';

import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MapPin, 
  Plus,
  Send,
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useApp } from '../../context/AppContext';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
}

interface Post {
  id: string;
  author: string;
  role: string;
  avatar: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  place: string;
  date: string;
  isLiked?: boolean;
  comments: Comment[];
}

export default function Community() {
  const { t, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  
  // New Post Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newContent, setNewContent] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'po1',
      author: 'Kabir Mehta',
      role: language === 'HI' ? 'व्हीलचेयर यात्री' : 'Wheelchair Traveller',
      avatar: 'KM',
      title: language === 'HI' ? 'दिल्ली मेट्रो रेड लाइन पहुंच गाइड' : 'Guide to Delhi Metro Red Line Accessibility',
      content: language === 'HI' 
        ? 'अधिकांश रेड लाइन स्टेशनों पर स्पर्शनीय टाइलें अपडेट की गई हैं। कनॉट प्लेस में लिफ्ट पूरी तरह से चालू हैं, लेकिन ध्यान रखें कि गेट 3 लिफ्ट को सहायता कार्ड टैप की आवश्यकता होती है।'
        : 'Most Red Line stations now have tactile paving updated. Elevators at Connaught Place are fully operational, but keep in mind that the gate 3 lift needs assistance card tap.',
      likes: 24,
      replies: 2,
      place: language === 'HI' ? 'कनॉट प्लेस मेट्रो स्टेशन' : 'Connaught Place Station',
      date: language === 'HI' ? '2 घंटे पहले' : '2 hours ago',
      isLiked: false,
      comments: [
        {
          id: 'c1',
          author: 'Ananya Roy',
          avatar: 'AR',
          time: '1 hr ago',
          content: language === 'HI' ? 'यह बहुत मददगार जानकारी है, धन्यवाद कबीर!' : 'Super helpful info, thanks Kabir!'
        },
        {
          id: 'c2',
          author: 'Dev Sharma',
          avatar: 'DS',
          time: '30 mins ago',
          content: language === 'HI' ? 'क्या रैंप गेट 2 पर भी खुला है?' : 'Is the ramp on Gate 2 open as well?'
        }
      ]
    },
    {
      id: 'po2',
      author: 'Elena Rostova',
      role: language === 'HI' ? 'लेखा परीक्षक साथी' : 'Auditor Fellow',
      avatar: 'ER',
      title: language === 'HI' ? 'लोधी गार्डन शौचालय ऑडिट विवरण' : 'Lodhi Gardens Restrooms Audited',
      content: language === 'HI'
        ? 'हमने आज लोधी गार्डन का पहुंच ऑडिट पूरा किया। गेट 2 पूरी तरह से बाधा मुक्त है। रैंप मानक 1:12 ढलान के हैं। दो सुलभ वाशरूम चालू पाए गए।'
        : 'We finished an accessibility audit of Lodhi Gardens today. Entrance 2 is completely barrier-free. Ramps are standard 1:12 slope. Two accessible washrooms found operational.',
      likes: 42,
      replies: 1,
      place: language === 'HI' ? 'लोधी गार्डन' : 'Lodhi Gardens',
      date: language === 'HI' ? '1 दिन पहले' : '1 day ago',
      isLiked: true,
      comments: [
        {
          id: 'c3',
          author: 'Sunil Verma',
          avatar: 'SV',
          time: '5 hrs ago',
          content: language === 'HI' ? 'शानदार ऑडिट रिपोर्ट! यात्रा सुलभ हो गई।' : 'Fantastic audit report! Makes visiting much smoother.'
        }
      ]
    }
  ]);

  const handleToggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: string) => {
    if (!replyInput.trim()) return;
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: 'Aarav Sharma',
      avatar: 'AS',
      time: 'Just now',
      content: replyInput.trim()
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: p.replies + 1,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setReplyInput('');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const createdPost: Post = {
      id: `po_${Date.now()}`,
      author: 'Aarav Sharma',
      role: language === 'HI' ? 'सत्यापित सहयात्री' : 'Verified Traveller',
      avatar: 'AS',
      title: newTitle.trim(),
      content: newContent.trim(),
      place: newPlace.trim() || (language === 'HI' ? 'नई दिल्ली' : 'New Delhi'),
      likes: 1,
      replies: 0,
      date: language === 'HI' ? 'अभी' : 'Just now',
      isLiked: true,
      comments: []
    };

    setPosts([createdPost, ...posts]);
    setPostSuccess(true);

    setTimeout(() => {
      setPostSuccess(false);
      setShowNewPostModal(false);
      setNewTitle('');
      setNewPlace('');
      setNewContent('');
    }, 1200);
  };

  const handleShare = (postTitle: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(`Copied link for "${postTitle}" to clipboard!`);
    } else {
      alert(`Sharing post: "${postTitle}"`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FC] dark:bg-slate-950 transition-colors">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Header section */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                {t('community')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {language === 'HI' 
                  ? 'सहयात्रियों से जुड़ें, अनुभव साझा करें और सत्यापित पहुँच ब्लॉग लिखें।' 
                  : 'Connect with fellow travelers, publish accessibility blogs, and read verified reviews.'
                }
              </p>
            </div>
            
            <button 
              onClick={() => setShowNewPostModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'HI' ? 'नया ब्लॉग लिखें' : 'New Blog Post'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Posts feed (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-6 shadow-sm hover:shadow-md transition-all duration-150">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                        {post.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.author}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{post.role} • {post.date}</p>
                      </div>
                    </div>

                    {post.place && (
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2.5 py-1 rounded-lg border border-violet-200/60 dark:border-violet-800/40 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {post.place}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mt-4 leading-snug">{post.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2.5 whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Actions strip */}
                  <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <button 
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${post.isLiked ? 'text-violet-600 dark:text-violet-400 font-bold' : 'hover:text-violet-600 dark:hover:text-violet-400'}`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes} {language === 'HI' ? 'पसंद' : 'Likes'}</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.replies} {language === 'HI' ? 'उत्तर' : 'Replies'}</span>
                    </button>

                    <button 
                      onClick={() => handleShare(post.title)}
                      className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors ml-auto cursor-pointer"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>{language === 'HI' ? 'साझा करें' : 'Share'}</span>
                    </button>
                  </div>

                  {/* Comments section */}
                  {(activeReplyPostId === post.id || post.comments.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                      {/* Comments list */}
                      {post.comments.map((comm) => (
                        <div key={comm.id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 text-xs">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span className="text-slate-800 dark:text-slate-200">{comm.author}</span>
                            <span>{comm.time}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{comm.content}</p>
                        </div>
                      ))}

                      {/* Reply Box */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={activeReplyPostId === post.id ? replyInput : ''}
                          onFocus={() => setActiveReplyPostId(post.id)}
                          onChange={(e) => {
                            setActiveReplyPostId(post.id);
                            setReplyInput(e.target.value);
                          }}
                          placeholder={language === 'HI' ? 'टिप्पणी लिखें...' : 'Write a comment...'}
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-xl transition-all cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar Guidelines/Stats (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0a0f] p-5 shadow-sm space-y-4 transition-colors">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {language === 'HI' ? 'समुदाय की स्थिति' : 'Community Standings'}
                </h4>
                <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <span>{language === 'HI' ? 'सत्यापित समीक्षक' : 'Verified Reviewers'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">142</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    <span>{language === 'HI' ? 'सक्रिय ऑडिटेड स्मारक' : 'Active Audited Monuments'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">28</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'HI' ? 'सफल वैकल्पिक मार्ग' : 'Successful Detours Reported'}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200">308</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>

        {/* Create New Blog / Post Modal */}
        {showNewPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#121420] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
              <button 
                onClick={() => setShowNewPostModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {language === 'HI' ? 'नया समुदाय ब्लॉग बनाएं' : 'Create Community Post / Blog'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'HI' ? 'सुलभ स्थानों के अनुभव और अपडेट साझा करें' : 'Share accessibility updates, ramp status, and transit tips.'}
                  </p>
                </div>
              </div>

              {postSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle className="h-12 w-12 text-emerald-500 animate-bounce" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {language === 'HI' ? 'ब्लॉग सफलतापूर्वक प्रकाशित हुआ!' : 'Post Published Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {language === 'HI' ? 'आपका ब्लॉग समुदाय में दिखाई दे रहा है।' : 'Your update is now visible in the community feed.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'HI' ? 'शीर्षक' : 'Title / Topic'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={language === 'HI' ? 'उदा: इंडिया गेट व्हीलचेयर रैंप अपडेट' : 'e.g. India Gate Ramp Accessibility Review'}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'HI' ? 'स्थान (वैकल्पिक)' : 'Location / Place (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={newPlace}
                      onChange={(e) => setNewPlace(e.target.value)}
                      placeholder={language === 'HI' ? 'उदा: लाल किला गेट 1' : 'e.g. Red Fort Gate 1'}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'HI' ? 'सामग्री / विवरण' : 'Blog Content / Details'}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder={language === 'HI' ? 'अपनी समीक्षा, लिफ्ट की स्थिति, या सुलभ शौचालय का विवरण साझा करें...' : 'Describe accessibility features, elevator operational status, tactile path info...'}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewPostModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {language === 'HI' ? 'रद्द करें' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all hover:scale-105 cursor-pointer"
                    >
                      {language === 'HI' ? 'प्रकाशित करें' : 'Publish Blog'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
