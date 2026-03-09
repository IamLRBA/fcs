'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, FreeMode } from 'swiper/modules'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react'
import Button from '@/components/ui/Button'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'

const fashionVideos = [
  {
    id: 1,
    title: 'Styling Tips - "Casual to Elegant"',
    description: 'Transform your everyday look into elegant evening wear',
    src: '/assets/videos/fashion/styling-casual-elegant.mp4',
    thumbnail: '/assets/images/videos/fashion/styling-casual-elegant-cover.jpg',
    duration: '4:55'
  },
  {
    id: 2,
    title: 'Accessorizing Guide - "Jewelry & Bags"',
    description: 'Complete guide to accessorizing with jewelry and handbags',
    src: '/assets/videos/fashion/accessorizing-guide.mp4',
    thumbnail: '/assets/images/videos/fashion/accessorizing-guide-cover.jpg',
    duration: '1:09'
  },
  {
    id: 3,
    title: 'Color Coordination - "Seasonal Palettes"',
    description: 'Mastering color coordination for different seasons',
    src: '/assets/videos/fashion/color-coordination-seasonal.mp4',
    thumbnail: '/assets/images/videos/fashion/color-coordination-seasonal-cover.jpg',
    duration: '7:05'
  },
  {
    id: 4,
    title: 'Body Type Styling - "Flattering Silhouettes"',
    description: 'Dress for your body type with confidence',
    src: '/assets/videos/fashion/body-type-styling.mp4',
    thumbnail: '/assets/images/videos/fashion/body-type-styling-cover.jpg',
    duration: '09:07'
  },
  {
    id: 5,
    title: 'Wisdom Kaye - "Fashion Ananlysis"',
    description: 'Wisdom Kaye Breaks Down The Outfits That Made Him Famous (And A Multimillionaire)',
    src: '/assets/videos/fashion/fashion-analysis.mp4',
    thumbnail: '/assets/images/videos/fashion/fashion-analysis-cover.jpg',
    duration: '8:45'
  }
]

export default function FashionVideoSection() {
  const [selectedVideo, setSelectedVideo] = useState(fashionVideos[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState<number | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [showTitleDescription, setShowTitleDescription] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (showControls && isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => {
      if (controlsTimeoutRef.current !== null) {
        window.clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls, isPlaying])

  useEffect(() => {
    const preloadVideo = (src: string) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = src
      video.load()
    }
    fashionVideos.forEach(video => {
      preloadVideo(video.src)
    })
  }, [])

  const handleVideoSelect = (video: typeof fashionVideos[0]) => {
    setSelectedVideo(video)
    setProgress(0)
    setShowControls(true)
    setIsLoading(true)
    setVideoError(null)
    setShowTitleDescription(true) // Show title/description when video is selected
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => {
          setIsPlaying(true)
          // Hide title/description after 3 seconds when video starts playing
          setTimeout(() => {
            setShowTitleDescription(false)
          }, 3000)
        }).catch(() => {
          setIsPlaying(false)
        })
      }
    }, 100)
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
        // Hide title/description after 3 seconds when video starts playing
        setShowTitleDescription(true)
        setTimeout(() => {
          setShowTitleDescription(false)
        }, 3000)
      }
    }
    setIsPlaying(!isPlaying)
    setShowControls(true)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
    setShowControls(true)
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
    setIsMuted(!isMuted)
    setShowControls(true)
  }

  const handleDuration = (duration: number) => {
    if (duration && isFinite(duration) && duration > 0) {
      setDuration(duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const clickPercent = clickX / width
    if (videoRef.current) {
      videoRef.current.currentTime = clickPercent * videoRef.current.duration
    }
    setShowControls(true)
  }

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
    setShowControls(true)
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      setShowControls(true)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds) || seconds < 0) {
      return '0:00'
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
  }

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false)
    }
  }

  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto"
      >
        <h2 className="text-4xl md:text-4xl font-bold text-center mb-16">
        <span className="text-primary-500">↻ ◁ |</span><span className="text-neutral-700 dark:text-primary-300">| ▷ ↺</span>
        </h2>
        
        <div className="hero-glass-frame relative backdrop-blur-lg">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
        <div className="bg-gradient-to-br from-primary-50/80 to-primary-100/60 dark:from-white/10 dark:to-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-primary-200/40 dark:border-white/20 shadow-lg">
          <div 
            ref={containerRef}
            className="relative aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <video
              ref={videoRef}
              src={selectedVideo.src}
              poster={selectedVideo.thumbnail}
              className="w-full h-full object-cover"
              autoPlay={isPlaying}
              muted={isMuted}
              playsInline
              onLoadedMetadata={() => {
                if (videoRef.current && videoRef.current.duration && isFinite(videoRef.current.duration)) {
                  handleDuration(videoRef.current.duration)
                  setIsLoading(false)
                }
              }}
              onTimeUpdate={() => {
                if (videoRef.current && videoRef.current.duration && isFinite(videoRef.current.duration)) {
                  setProgress(videoRef.current.currentTime / videoRef.current.duration)
                }
              }}
              onError={() => {
                setVideoError('Failed to load video. Please try again.')
                setIsLoading(false)
              }}
              onPlay={() => setIsLoading(false)}
              onPause={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayPause}
                className="w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 pointer-events-auto"
              >
                {isPlaying ? (
                  <Pause size={32} />
                ) : (
                  <Play size={32} className="ml-1" />
                )}
              </motion.button>
            </div>
            
            {isLoading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-white/80 text-xs">Loading...</p>
                </div>
              </div>
            )}
            
            {videoError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <div className="text-center p-4 sm:p-6">
                  <div className="text-red-400 mb-2 sm:mb-4">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-white text-sm sm:text-lg mb-3 sm:mb-4 px-2">{videoError}</p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setVideoError(null)
                      setIsLoading(true)
                      const currentSrc = selectedVideo.src
                      setSelectedVideo({ ...selectedVideo, src: '' })
                      setTimeout(() => setSelectedVideo({ ...selectedVideo, src: currentSrc }), 100)
                    }}
                    className="justify-center text-xs sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 !text-white !border-white hover:!bg-white/20 hover:!text-white"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: showTitleDescription ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-4 left-4 z-10 pointer-events-none"
            >
              <h3 className="text-white text-xl font-bold mb-1">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-white/80 text-sm">{selectedVideo.description}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            >
              {/* Progress bar - hidden on mobile, shown in fullscreen or desktop */}
              <div 
                className={`w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4 ${isFullscreen ? 'block' : 'hidden md:block'}`}
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-primary-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                {/* Left side controls - simplified on mobile, full controls in fullscreen */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlayPause}
                    className="text-white hover:text-primary-300 transition-colors duration-300"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  {/* Hide these controls on mobile (unless fullscreen), show on desktop or in fullscreen */}
                  <button
                    onClick={() => {
                      const currentIndex = fashionVideos.findIndex(video => video.id === selectedVideo.id)
                      const prevIndex = (currentIndex - 1 + fashionVideos.length) % fashionVideos.length
                      handleVideoSelect(fashionVideos[prevIndex])
                    }}
                    className={`${isFullscreen ? 'block' : 'hidden md:block'} text-white/70 hover:text-white transition-colors duration-300`}
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = fashionVideos.findIndex(video => video.id === selectedVideo.id)
                      const nextIndex = (currentIndex + 1) % fashionVideos.length
                      handleVideoSelect(fashionVideos[nextIndex])
                    }}
                    className={`${isFullscreen ? 'block' : 'hidden md:block'} text-white/70 hover:text-white transition-colors duration-300`}
                  >
                    <SkipForward size={20} />
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
                      }
                    }}
                    className={`${isFullscreen ? 'block' : 'hidden md:block'} text-white/70 hover:text-white transition-colors duration-300`}
                  >
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                      <span className="text-xs font-medium text-white/70">10</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10)
                      }
                    }}
                    className={`${isFullscreen ? 'block' : 'hidden md:block'} text-white/70 hover:text-white transition-colors duration-300`}
                  >
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-xs font-medium text-white/70">10</span>
                      <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                    </div>
                  </button>

                  <span className={`${isFullscreen ? 'block' : 'hidden md:block'} text-white/80 text-sm`}>
                    {formatTime(progress * (duration || 0))} / {formatTime(duration || 0)}
                  </span>
                </div>

                {/* Right side controls - only maximize on mobile, all controls in fullscreen */}
                <div className="flex items-center space-x-4">
                  <div className={`${isFullscreen ? 'flex' : 'hidden md:flex'} items-center space-x-2`}>
                    <button
                      onClick={handleMuteToggle}
                      className="text-white/70 hover:text-white transition-colors duration-300"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer slider"
                    />
                  </div>

                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`${isFullscreen ? 'block' : 'hidden md:block'} text-white/70 hover:text-white transition-colors duration-300`}
                  >
                    <Settings size={20} />
                  </button>

                  <button
                    onClick={handleFullscreen}
                    className="text-white/70 hover:text-white transition-colors duration-300"
                  >
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-6 sm:mt-8 w-full">
            <Swiper
              modules={[Navigation, Pagination, FreeMode]}
              spaceBetween={12}
              slidesPerView={2}
              freeMode={true}
              navigation={true}
              pagination={{ clickable: true }}
              watchOverflow={true}
              watchSlidesProgress={true}
              breakpoints={{
                320: {
                  slidesPerView: 2,
                  spaceBetween: 12,
                },
                640: {
                  slidesPerView: 3,
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 16,
                },
                1280: {
                  slidesPerView: 5,
                  spaceBetween: 16,
                },
              }}
              className="video-swiper w-full"
              style={{ paddingBottom: '40px' }}
            >
              {fashionVideos.map((video) => (
                <SwiperSlide key={video.id}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer p-2"
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div
                      className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary-200/60 to-primary-300/40 dark:from-primary-800/50 dark:to-accent-800/50 border border-primary-300/30 dark:border-transparent w-full"
                      style={{ paddingTop: '55%', minHeight: '110px' }}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = '1';
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.3s' }}
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-200/60 to-primary-300/40 dark:from-primary-800/50 dark:to-accent-800/50"
                        style={{display: 'none'}}
                      >
                        <div className="text-center px-2">
                          <div className="w-8 h-8 mx-auto mb-2 text-primary-600 dark:text-primary-300">
                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-primary-700 dark:text-primary-300 text-xs font-medium break-words">{video.title}</p>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                             onClick={(e) => {
                               e.stopPropagation();
                               if (selectedVideo.id === video.id) {
                                 handlePlayPause();
                               } else {
                                 handleVideoSelect(video);
                               }
                             }}>
                          {selectedVideo.id === video.id && isPlaying ? (
                            <Pause size={20} className="text-white" />
                          ) : (
                            <Play size={20} className="text-white ml-1" />
                          )}
                        </div>
                      </div>

                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      )}

                      {selectedVideo.id === video.id && (
                        <div className="absolute top-2 left-2 w-3 h-3 bg-primary-400 rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    <div className="mt-2 w-full">
                      <h4 className="text-neutral-850 dark:text-white text-sm font-medium truncate w-full">{video.title}</h4>
                      <p className="text-neutral-700 dark:text-primary-300 text-xs truncate w-full">{video.description}</p>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
        </div>
      </motion.div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-primary-300);
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-primary-300);
          cursor: pointer;
          border: none;
        }

        .video-swiper {
          width: 100%;
          overflow: visible;
        }
        
        .video-swiper .swiper-wrapper {
          display: flex;
          align-items: stretch;
        }
        
        .video-swiper .swiper-slide {
          height: auto;
          display: flex;
        }
        
        .video-swiper .swiper-button-next,
        .video-swiper .swiper-button-prev {
          top: 25%;
          transform: translateY(-50%);
          background: transparent;
          width: auto;
          height: auto;
          border: none;
          color: var(--color-primary-300);
          z-index: 10;
        }
        
        .video-swiper .swiper-button-prev,
        .video-swiper .swiper-button-next {
          display: none !important;
        }

        .video-swiper .swiper-pagination-bullet {
          background: var(--color-primary-300);
          opacity: 0.6;
          transition: background-color 0.3s ease, opacity 0.3s ease;
        }
        .video-swiper .swiper-pagination-bullet-active {
          background: var(--color-primary-300);
          opacity: 1;
        }
      `}</style>
    </section>
  )
}
