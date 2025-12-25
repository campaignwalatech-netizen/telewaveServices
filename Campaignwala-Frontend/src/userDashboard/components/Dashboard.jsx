import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2 } from 'lucide-react';
import api from '../../services/api';
import walletService from '../../services/walletService';
import leadService from '../../services/leadService';
import authService from '../../services/authService';


const Dashboard = ({ darkMode }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slidesLoading, setSlidesLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0
  });
  const [leadsStats, setLeadsStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [userName, setUserName] = useState('#user');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  // Enhanced colors for categories with better gradients
  const categoryColors = [
    'from-amber-400 to-orange-500',
    'from-blue-400 to-cyan-500',
    'from-slate-700 to-slate-800',
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-purple-500',
    'from-green-400 to-emerald-500',
    'from-rose-400 to-pink-500',
    'from-indigo-400 to-blue-500',
  ];

  useEffect(() => {
    // Check registration status before loading dashboard
    checkRegistrationStatus();
    fetchCategories();
    fetchWalletData();
    fetchLeadsStats();
    fetchUserProfile();
    fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect for audio setup after component mounts
  useEffect(() => {
    // Wait for audio element to be available
    const setupAudio = () => {
      if (audioRef.current) {
        const audio = audioRef.current;
        
        const handleCanPlay = () => {
          setAudioError(false);
        };
        
        const handleError = (e) => {
          console.error('Audio error:', e);
          setAudioError(true);
          setIsPlaying(false);
        };
        
        const handleLoadStart = () => {
          setAudioError(false);
        };
        
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('loadstart', handleLoadStart);
        
        // Try to load the audio
        audio.load().catch((error) => {
          console.error('Error loading audio:', error);
          setAudioError(true);
        });
        
        return () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('loadstart', handleLoadStart);
        };
      }
    };
    
    // Small delay to ensure audio element is mounted
    const timer = setTimeout(setupAudio, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const checkRegistrationStatus = () => {
    // Using authService to check if user is approved
    if (!authService.isUserApproved()) {
      const status = authService.getUserRegistrationStatus();
      console.log(`⚠️ User not approved (status: ${status}), redirecting to pending approval`);
      navigate('/pending-approval', { replace: true });
      return;
    }
  };

  // Auto-slide effect with smooth transition - Include all slides
  useEffect(() => {
    if (isPaused) return;
    
    // Calculate total slides: backend slides + 10 static slides
    const totalSlides = slides.length > 0 ? slides.length + 10 : 10;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        setUserName(response.data.data.user?.name || '#user');
        // Double-check registration status from API
        if (response.data.data.user?.registrationStatus !== 'approved') {
          navigate('/pending-approval', { replace: true });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchWalletData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        const user = JSON.parse(userData);
        if (user._id) {
          const response = await walletService.getWalletByUserId(user._id);
          if (response.success) {
            setWalletData({
              balance: response.data.balance || 0,
              totalEarned: response.data.totalEarned || 0,
              totalWithdrawn: response.data.totalWithdrawn || 0
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const fetchLeadsStats = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined' && userData !== 'null') {
        const user = JSON.parse(userData);
        if (user._id) {
          const response = await leadService.getLeadStats(user._id);
          if (response.success) {
            setLeadsStats({
              total: response.data.total || 0,
              pending: response.data.pending || 0,
              approved: response.data.approved || 0,
              rejected: response.data.rejected || 0
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching leads stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories', {
        params: {
          status: 'active',
          limit: 10
        }
      });
      
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlides = async () => {
    try {
      setSlidesLoading(true);
      const response = await api.get('/slides', {
        params: {
          status: 'active',
          limit: 10,
          sortBy: 'order',
          order: 'asc'
        }
      });
      
      if (response.data.success) {
        setSlides(response.data.data.slides || []);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setSlidesLoading(false);
    }
  };

  // Static slides configuration
  const staticSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop",
      alt: "Earn More & More",
      title: "Earn More & More!!",
      description: "Grow your skills and earnings with our exclusive programs!",
      gradient: "from-indigo-600/80 to-purple-600/80",
      buttonText: ""
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop",
      alt: "Big Offers Coming",
      title: "Big Offers Coming Soon!!",
      description: "Get ready for amazing deals and exclusive benefits!",
      gradient: "from-orange-600/80 to-red-600/80",
      buttonText: ""
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop",
      alt: "Savings Account Offers",
      title: "Saving Offers Are Live Going On!",
      description: "Don't miss out on exclusive savings account benefits!",
      gradient: "from-green-600/80 to-teal-600/80",
      buttonText: ""
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=400&fit=crop",
      alt: "Demat Account Special Offers",
      title: "Demat Offers Going On!",
      description: "Exclusive deals on demat accounts - Limited time only!",
      gradient: "from-blue-600/80 to-purple-600/80",
      buttonText: "Explore Now"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=400&fit=crop",
      alt: "Credit Card Special Offers",
      title: "Credit Card Offers Live!",
      description: "Get amazing rewards and cashback on premium credit cards!",
      gradient: "from-amber-600/80 to-orange-600/80",
      buttonText: "Apply Now"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&h=400&fit=crop",
      alt: "Personal Loan Offers",
      title: "Personal Loan Offers!",
      description: "Low interest rates and instant approval available now!",
      gradient: "from-red-600/80 to-pink-600/80",
      buttonText: "Get Loan"
    },
    {
      id: 7,
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=400&fit=crop",
      alt: "Investment Opportunities",
      title: "Investment Offers Live!",
      description: "Start your investment journey with exclusive bonuses!",
      gradient: "from-emerald-600/80 to-green-600/80",
      buttonText: "Invest Now"
    },
    {
      id: 8,
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop",
      alt: "Saturday Bonus",
      title: "Saturday Special Bonus!",
      description: "You will get ₹100 per account on every Saturday!",
      description2: "Complete your accounts and earn weekly bonuses!",
      gradient: "from-yellow-600/80 to-amber-600/80",
      buttonText: "Claim Bonus"
    },
    {
      id: 9,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=400&fit=crop",
      alt: "Weekly Rewards",
      title: "Weekly Rewards Program!",
      description: "Get ₹100 per account every Saturday!",
      description2: "Join now and start earning weekly bonuses!",
      gradient: "from-pink-600/80 to-rose-600/80",
      buttonText: "Join Now"
    },
    {
      id: 10,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop",
      alt: "Account Bonus",
      title: "Account Bonus Every Saturday!",
      description: "Earn ₹100 per account on every Saturday!",
      description2: "Don't miss out on your weekly earnings!",
      gradient: "from-indigo-600/80 to-blue-600/80",
      buttonText: "Learn More"
    }
  ];

  // Calculate total slides
  const totalSlides = slides.length + staticSlides.length;

  // Navigation functions
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Slide Component
  const SlideItem = ({ slide, slideWidth }) => (
    <div
      className="relative shrink-0 h-full"
      style={{ width: `${slideWidth}%` }}
    >
      <img 
        src={slide.image} 
        alt={slide.alt} 
        className="w-full h-full object-cover"
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} flex items-center justify-center`}>
        <div className="text-center px-3 sm:px-4">
          <h3 className="text-white text-lg sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2">
            {slide.title}
          </h3>
          <p className="text-white/90 text-xs sm:text-sm md:text-lg mb-2">
            {slide.description}
          </p>
          {slide.description2 && (
            <p className="text-white/80 text-xs sm:text-sm">
              {slide.description2}
            </p>
          )}
          {slide.buttonText && (
            <div className="mt-2 sm:mt-4 bg-gray-400 text-gray-600 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold cursor-not-allowed text-xs sm:text-base">
              {slide.buttonText}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 md:p-8 transition-all duration-300 ${
        darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-10 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Welcome Section - UPDATED TEXT */}
      <section className="relative z-10 mb-6 sm:mb-8 px-2">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
            Welcome, <span className="capitalize font-semibold">{userName}</span>! 🌟
          </h2>
          
          {/* Audio Player */}
          {!audioError && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all hover:scale-105 ${
              darkMode 
                ? 'bg-gray-800/80 border border-gray-700' 
                : 'bg-white/90 border border-gray-200'
            }`}>
              <audio
                ref={audioRef}
                src="/sample-audio.mp3"
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={(e) => {
                  console.error('Audio playback error:', e);
                  setAudioError(true);
                  setIsPlaying(false);
                }}
                onLoadedData={() => {
                  setAudioError(false);
                }}
                onCanPlay={() => {
                  setAudioError(false);
                }}
              />
              <button
                onClick={async () => {
                  if (!audioRef.current || audioError) return;
                  
                  try {
                    if (isPlaying) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    } else {
                      // Ensure audio is loaded
                      if (audioRef.current.readyState === 0) {
                        audioRef.current.load();
                      }
                      
                      // Play the audio - handle the promise
                      const playPromise = audioRef.current.play();
                      
                      if (playPromise !== undefined) {
                        playPromise
                          .then(() => {
                            setIsPlaying(true);
                          })
                          .catch((error) => {
                            console.error('Error playing audio:', error);
                            setAudioError(true);
                            setIsPlaying(false);
                          });
                      }
                    }
                  } catch (error) {
                    console.error('Error with audio:', error);
                    setAudioError(true);
                    setIsPlaying(false);
                  }
                }}
                disabled={audioError}
                className={`p-2 rounded-full transition-colors ${
                  audioError
                    ? 'opacity-50 cursor-not-allowed'
                    : darkMode
                    ? 'hover:bg-gray-700 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
                title={audioError ? "Audio not available" : isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`} />
            </div>
          )}
        </div>
        <p className={`text-xs sm:text-sm md:text-base text-center max-w-2xl mx-auto px-4 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Here's a quick overview of your campaign performance and available opportunities.
        </p>
      </section>

      {/* Stats Cards */}
      <section className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[
          {
            title: 'Current Balance',
            amount: `₹ ${walletData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: `Total withdrawn: ₹${walletData.totalWithdrawn.toLocaleString('en-IN')}`,
            img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop',
            color: 'text-blue-600',
            icon: '💰',
            bgGradient: 'from-blue-500 to-cyan-500',
            borderColor: 'border-blue-400'
          },
          {
            title: 'Total Earnings',
            amount: `₹ ${walletData.totalEarned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: `${leadsStats.approved} leads approved`,
            img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
            color: 'text-green-600',
            icon: '📈',
            bgGradient: 'from-green-500 to-emerald-500',
            borderColor: 'border-green-400'
          },
          {
            title: 'Total Leads',
            amount: `${leadsStats.total}`,
            change: `${leadsStats.pending} pending, ${leadsStats.rejected} rejected`,
            img: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=300&fit=crop',
            color: 'text-purple-600',
            icon: '🎯',
            bgGradient: 'from-purple-500 to-pink-500',
            borderColor: 'border-purple-400'
          },
        ].map((card) => (
          <div
            key={card.title}
            onClick={() => {
              if (card.title === "Current Balance") {
                navigate("/user/wallet-withdrawl");
              } else if (card.title === "Total Earnings") {
                navigate("/user/total-balance");
              } else if (card.title === "Total Leads") {
                navigate("/user/all-leads");
              }
            }}
            className={`rounded-xl p-3 sm:p-4 border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              darkMode 
                ? `bg-gradient-to-br ${card.bgGradient} border-gray-600 text-white` 
                : `bg-white ${card.borderColor}`
            }`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">{card.title}</span>
              <span className="text-lg sm:text-xl">{card.icon}</span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 break-words">{card.amount}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full inline-block">
              {card.change}
            </div>
          </div>
        ))}
      </section>

      {/* Banner Section - Horizontal Sliding Swiper */}
      <section className="relative z-10 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 overflow-hidden shadow-2xl ring-2 ring-blue-300 dark:ring-blue-200">
        <div 
          className="relative overflow-hidden h-40 sm:h-48 md:h-56 lg:h-64"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevSlide}
            className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
              darkMode 
                ? 'bg-gray-800/80 text-white hover:bg-gray-700/80' 
                : 'bg-white/80 text-gray-800 hover:bg-white'
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goToNextSlide}
            className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
              darkMode 
                ? 'bg-gray-800/80 text-white hover:bg-gray-700/80' 
                : 'bg-white/80 text-gray-800 hover:bg-white'
            }`}
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <style>{`
            @keyframes slideCarousel {
              0% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(-${100 / totalSlides}%);
              }
            }
          `}</style>
          
          {slidesLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <div 
                className="flex h-full transition-transform duration-3500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`,
                  width: `${totalSlides * 100}%`
                }}
              >
                {/* Backend slides */}
                {slides.map((slide, index) => (
                <div
                    key={`backend-${slide._id || index}`}
                    className="relative shrink-0 h-full"
                    style={{ width: `${100 / totalSlides}%` }}
                >
                  <img 
                      src={slide.image || slide.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop"} 
                      alt={slide.title || slide.name || "Slide"} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80 flex items-center justify-center">
                    <div className="text-center px-3 sm:px-4">
                      <h3 className="text-white text-lg sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2">
                          {slide.title || slide.name || "Special Offer"}
                      </h3>
                      <p className="text-white/90 text-xs sm:text-sm md:text-lg">
                          {slide.description || slide.subtitle || "Check out our amazing deals!"}
                      </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Static slides */}
                {staticSlides.map((slide) => (
                  <SlideItem 
                    key={`static-${slide.id}`} 
                    slide={slide} 
                    slideWidth={100 / totalSlides}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Navigation Dots */}
          {!slidesLoading && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all rounded-full ${
                    currentSlide === index
                      ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-blue-600 dark:bg-blue-400'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/60 dark:bg-gray-600/60 hover:bg-white/80 dark:hover:bg-gray-500/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Cards */}
      <section className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          // Loading state
          <div className="col-span-full text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 text-sm sm:text-base">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          // Categories from backend
          categories.map((category, index) => (
            <div
              key={category._id || index}
              onClick={() => {
                // Navigate to category offers page with category ID and name
                navigate(`/user/category-offers/${category._id}`, {
                  state: { 
                    categoryId: category._id,
                    categoryName: category.name,
                    categoryDescription: category.description
                  }
                });
              }}
              className={`rounded-xl border-3 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 shadow-md ring-1 ring-gray-200 dark:ring-gray-600 ${
                darkMode ? 'bg-orange-800 border-orange-500' : 'bg-white border-orange-400'
              }`}
            >
              <div
                className={`bg-gradient-to-br ${categoryColors[index % categoryColors.length]} h-20 sm:h-24 md:h-28 lg:h-32 flex items-center justify-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="text-white text-base sm:text-lg font-bold text-center px-2 relative z-10">
                  {category.name?.split(' ')[0] || 'Category'}
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <h3
                  className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {category.name}
                </h3>
                <p
                  className={`text-xs sm:text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {category.description || 'Available offers'}
                </p>
                <div className="mt-2 sm:mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  View Offers →
                </div>
              </div>
            </div>
          ))
        ) : (
          // Fallback - no categories found
          [
            {
              title: 'Industrial Bank Credit Card',
              reward: 'Earn ₹ 1,100',
              color: 'from-amber-400 to-orange-500',
              img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
            },
            {
              title: 'Bajaj EMI Card',
              reward: 'Earn ₹ 800 ',
              color: 'from-blue-400 to-cyan-500',
              img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
            },
            {
              title: 'Demat Account',
              reward: 'Earn ₹ 750 ',
              color: 'from-slate-700 to-slate-800',
              img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
            },
            {
              title: 'MoneyTap Personal Loan',
              reward: 'Earn ₹ 2,100 ',
              color: 'from-emerald-400 to-teal-500',
              img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&h=300&fit=crop',
            },
            {
              title: 'Savings Account',
              reward: 'Earn ₹ 750 ',
              color: 'from-violet-400 to-purple-500',
              img: 'https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=400&h=300&fit=crop',
            },
            {
              title: 'Bajaj EMI Card (Offer 2)',
              reward: 'Earn ₹ 700',
              color: 'from-rose-400 to-pink-500',
              img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400&h=300&fit=crop',
            },
          ].map((card) => (
            <div
              key={card.title}
              onClick={() => {
                // Fallback navigation - use title as category name
                navigate(`/user/category-offers/fallback`, {
                  state: { 
                    categoryName: card.title,
                    categoryDescription: card.reward
                  }
                });
              }}
              className={`rounded-xl border-2 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div
                className={`bg-gradient-to-br ${card.color} h-20 sm:h-24 md:h-28 lg:h-32 flex items-center justify-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="text-white text-base sm:text-lg font-bold text-center px-2 relative z-10">
                  {card.title.split(' ')[0]}
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <h3
                  className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {card.reward}
                </p>
                <div className="mt-2 sm:mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                  View Offers →
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;