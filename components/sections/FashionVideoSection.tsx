'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react'
import Button from '@/components/ui/Button'
import HorizontalScrollAffordance from '@/components/ui/HorizontalScrollAffordance'

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
  /** No network load until user presses play */
  const [mediaSrc, setMediaSrc] = useState<string | null>(null)
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
  const shouldPlayAfterLoadRef = useRef(false)

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
    const el = videoRef.current
    if (!el || !mediaSrc) return
    const onCanPlay = () => {
      if (!shouldPlayAfterLoadRef.current) return
      shouldPlayAfterLoadRef.current = false
      el.play()
        .then(() => {
          setIsPlaying(true)
          setIsLoading(false)
          setShowTitleDescription(true)
          window.setTimeout(() => setShowTitleDescription(false), 3000)
        })
        .catch(() => {
          setIsPlaying(false)
          setIsLoading(false)
        })
    }
    el.addEventListener('canplay', onCanPlay)
    return () => el.removeEventListener('canplay', onCanPlay)
  }, [mediaSrc])

  const handleVideoSelect = useCallback((video: typeof fashionVideos[0]) => {
    shouldPlayAfterLoadRef.current = false
    setSelectedVideo(video)
    setMediaSrc(null)
    setProgress(0)
    setIsPlaying(false)
    setShowControls(true)
    setIsLoading(false)
    setVideoError(null)
    setShowTitleDescription(true)
    const el = videoRef.current
    if (el) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [])

  const handlePlayPause = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
      setShowControls(true)
      return
    }
    if (!mediaSrc) {
      shouldPlayAfterLoadRef.current = true
      setIsLoading(true)
      setVideoError(null)
      setMediaSrc(selectedVideo.src)
      setShowControls(true)
      return
    }
    el.play()
      .then(() => {
        setIsPlaying(true)
        setShowTitleDescription(true)
        window.setTimeout(() => setShowTitleDescription(false), 3000)
      })
      .catch(() => setIsPlaying(false))
    setShowControls(true)
  }, [isPlaying, mediaSrc, selectedVideo.src])

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
        
        <div className="hero-glass-frame relative backdrop-blur-sm">
          <div className="hero-glass-frame-overlay absolute inset-0 pointer-events-none" aria-hidden />
        <div className="bg-gradient-to-br from-primary-50/90 to-primary-100/70 dark:from-neutral-900/85 dark:to-neutral-800/80 rounded-2xl p-4 sm:p-6 md:p-8 border border-primary-200/40 dark:border-white/15 shadow-lg">
          <div 
            ref={containerRef}
            className="relative aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <video
              ref={videoRef}
              key={selectedVideo.id}
              src={mediaSrc ?? undefined}
              poster={selectedVideo.thumbnail}
              className="w-full h-full object-cover"
              preload="none"
              muted={isMuted}
              playsInline
              onLoadedMetadata={() => {
                if (videoRef.current && videoRef.current.duration && isFinite(videoRef.current.duration)) {
                  handleDuration(videoRef.current.duration)
                  if (!shouldPlayAfterLoadRef.current) setIsLoading(false)
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
              onLoadStart={() => {
                if (mediaSrc) setIsLoading(true)
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayPause}
                className="w-20 h-20 bg-black/55 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 pointer-events-auto shadow-lg"
                aria-label={isPlaying ? 'Pause' : 'Play video'}
              >
                {isPlaying ? (
                  <Pause size={32} />
                ) : (
                  <Play size={32} className="ml-1" />
                )}
              </motion.button>
            </div>
            
            {isLoading && (
              <div className="absolute inset-0 z-20 overflow-hidden rounded-lg" aria-busy aria-label="Loading video">
                <div className="absolute inset-0 skeleton rounded-none opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                  <div className="h-1 w-36 rounded-full bg-white/15 overflow-hidden">
                    <div className="h-full w-2/5 rounded-full bg-white/40 animate-pulse" />
                  </div>
                  <span className="text-white/60 text-xs">Preparing playback…</span>
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
                      setMediaSrc(null)
                      setTimeout(() => setMediaSrc(currentSrc), 50)
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
            <HorizontalScrollAffordance
              className="w-full"
              scrollClassName="pb-2"
              scrollAriaLabel="Video gallery thumbnails"
            >
              <div className="flex w-max flex-row gap-3 px-2 sm:gap-4 sm:px-4">
              {fashionVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-[min(200px,calc(50vw-2rem))] flex-shrink-0 cursor-pointer p-2 sm:w-[min(210px,calc(33.333vw-1.5rem))] lg:w-[min(230px,calc(25vw-1.25rem))] xl:w-[min(240px,calc(20vw-1rem))]"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div
                      className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary-200/60 to-primary-300/40 dark:from-primary-800/50 dark:to-accent-800/50 border border-primary-300/30 dark:border-transparent w-full"
                      style={{ paddingTop: '55%', minHeight: '110px' }}
                    >
                      <div className="absolute inset-0">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                          loading="lazy"
                        />
                      </div>
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
              ))}
              </div>
            </HorizontalScrollAffordance>
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
      `}</style>
    </section>
  )
}
