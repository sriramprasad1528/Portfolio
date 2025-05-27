import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Send, Sun, Moon, Github, Linkedin, Instagram } from 'lucide-react';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');
  const [formStatusType, setFormStatusType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [focused, setFocused] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sparkles, setSparkles] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Theme handling
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Mouse follower effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Canvas background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    const createParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor(window.innerWidth / 10), 100);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speed: Math.random() * 0.5 + 0.1,
          directionX: Math.random() * 2 - 1,
          directionY: Math.random() * 2 - 1,
          color: isDark
            ? `rgba(${Math.floor(100 + Math.random() * 50)}, ${Math.floor(120 + Math.random() * 80)}, ${Math.floor(180 + Math.random() * 75)}, ${0.1 + Math.random() * 0.2})`
            : `rgba(${Math.floor(50 + Math.random() * 100)}, ${Math.floor(80 + Math.random() * 100)}, ${Math.floor(150 + Math.random() * 105)}, ${0.1 + Math.random() * 0.1})`,
        });
      }
    };

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            const opacity = 1 - distance / 120;
            ctx.beginPath();
            ctx.strokeStyle = isDark
              ? `rgba(100, 120, 255, ${opacity * 0.15})`
              : `rgba(70, 130, 240, ${opacity * 0.07})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.x += particle.directionX * particle.speed;
        particle.y += particle.directionY * particle.speed;
        if (particle.x < 0 || particle.x > canvas.width) particle.directionX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.directionY *= -1;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  // Floating shapes animation
  useEffect(() => {
    const container = containerRef.current;
    const shapes = container.querySelectorAll('.floating-shape');
    shapes.forEach((shape) => {
      const randomX = Math.random() * 100 - 50;
      const randomY = Math.random() * 100 - 50;
      const randomRotate = Math.random() * 360;
      const randomDuration = 15 + Math.random() * 20;
      const randomDelay = Math.random() * 5;
      shape.style.setProperty('--random-x', `${randomX}px`);
      shape.style.setProperty('--random-y', `${randomY}px`);
      shape.style.setProperty('--random-rotate', `${randomRotate}deg`);
      shape.style.setProperty('--random-duration', `${randomDuration}s`);
      shape.style.setProperty('--random-delay', `${randomDelay}s`);
    });
  }, []);

  // Sparkle effect
  const createSparkle = (e) => {
    const newSparkle = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      size: Math.random() * 10 + 10,
      color: isDark
        ? `radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(125,160,255,0.2) 70%, transparent 100%)`
        : `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(100,180,255,0.3) 70%, transparent 100%)`,
    };
    setSparkles((prev) => [...prev, newSparkle]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((sparkle) => sparkle.id !== newSparkle.id));
    }, 1500);
  };

  // Form submission (original logic preserved)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus('Sending message...');
    setFormStatusType('info');

    try {
      const response = await fetch('https://portfolio-pjr6.onrender.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormStatus('Message sent successfully!');
        setFormStatusType('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          setFormStatus('');
          setFormStatusType(null);
          window.location.href = '/';
        }, 1000);
      } else {
        setFormStatus('Error sending message. Please try again.');
        setFormStatusType('error');
      }
    } catch (error) {
      setFormStatus('Error sending message. Please try again.');
      setFormStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: <Phone className="h-5 w-5" />, text: '+91 9392624107', color: 'text-green-600 dark:text-green-400' },
    { icon: <Mail className="h-5 w-5" />, text: 'sriram09877@gmail.com', color: 'text-blue-600 dark:text-blue-400' },
    { icon: <MapPin className="h-5 w-5" />, text: 'Hyderabad,IND', color: 'text-purple-600 dark:text-purple-400' },
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: <Github className="h-5 w-5" />,
      color: 'hover:text-gray-900 dark:hover:text-white',
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: <Linkedin className="h-5 w-5" />,
      color: 'hover:text-blue-600 dark:hover:text-blue-400',
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      icon: <Instagram className="h-5 w-5" />,
      color: 'hover:text-pink-600 dark:hover:text-pink-400',
    },
  ];

  const formSections = ['Contact Info', 'Message'];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const pageTransition = { type: 'spring', stiffness: 300, damping: 30 };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen relative overflow-hidden transition-colors duration-700"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at top right, #1f2937, #111827, #0f172a)'
            : 'radial-gradient(ellipse at top right, #f9fafb, #f3f4f6, #e5e7eb)',
        }}
        onClick={createSparkle}
      >
        {/* Background canvas animation */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" style={{ pointerEvents: 'none' }} />

        {/* Floating shapes */}
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="floating-shape absolute opacity-10 rounded-full animate-float"
              style={{
                width: `${50 + Math.random() * 100}px`,
                height: `${50 + Math.random() * 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: isDark
                  ? `radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0) 70%)`
                  : `radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 70%)`,
              }}
            />
          ))}
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`blob-${index}`}
              className="floating-shape absolute rounded-full animate-float"
              style={{
                width: `${100 + Math.random() * 200}px`,
                height: `${100 + Math.random() * 200}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: isDark
                  ? `radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%)`
                  : `radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, rgba(96, 165, 250, 0) 70%)`,
                opacity: 0.05,
              }}
            />
          ))}
        </div>

        {/* Mouse follower */}
        <motion.div
          className="fixed w-80 h-80 rounded-full pointer-events-none z-0 opacity-30"
          animate={{ x: mousePosition.x - 150, y: mousePosition.y - 150 }}
          transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            mixBlendMode: 'plus-lighter',
          }}
        />

        {/* Sparkles */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="sparkle fixed rounded-full"
            style={{
              left: sparkle.x - sparkle.size / 2,
              top: sparkle.y - sparkle.size / 2,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              background: sparkle.color,
            }}
          />
        ))}

        {/* Theme toggle button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsDark(!isDark);
          }}
          className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/20 backdrop-blur-md dark:bg-gray-800/20 text-gray-800 dark:text-gray-200 shadow-lg transition-all duration-300"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.button>

        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: 'backOut' }}
                className="inline-block"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4">
                Lead{' '}
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400"
                  >
                     Generation System
                  </motion.span>
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                Have a project in mind? Let's work together!
              </motion.p>
            </motion.div>

            {/* Contact Info Cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center justify-center space-x-3 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg backdrop-blur-sm shadow-lg transform transition-all duration-300"
                >
                  <motion.div whileHover={{ rotate: 20 }} className={info.color}>
                    {info.icon}
                  </motion.div>
                  <span className="text-gray-600 dark:text-gray-300">{info.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              className="relative w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {formSections.map((section, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    onClick={() => setActiveSection(index)}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                      activeSection === index
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {section}
                  </motion.button>
                ))}
              </div>

              <form onSubmit={handleContactSubmit} className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={pageTransition}
                  >
                    {activeSection === 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['name', 'email'].map((field, index) => (
                          <motion.div
                            key={field}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                          >
                            <motion.label
                              initial={formData[field] ? { y: -24, scale: 0.8 } : { y: 0, scale: 1 }}
                              animate={
                                focused === field
                                  ? { y: -24, scale: 0.8, color: '#3B82F6' }
                                  : formData[field]
                                  ? { y: -24, scale: 0.8 }
                                  : { y: 0, scale: 1 }
                              }
                              transition={{ duration: 0.3, type: 'spring', stiffness: 500 }}
                              className="absolute left-4 text-gray-500 dark:text-gray-400 origin-left pointer-events-none z-10 px-1 bg-white dark:bg-gray-800"
                              style={{ top: 12 }}
                            >
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </motion.label>
                            <motion.input
                              type={field === 'email' ? 'email' : 'text'}
                              name={field}
                              value={formData[field]}
                              onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                              onFocus={() => setFocused(field)}
                              onBlur={() => setFocused(null)}
                              whileFocus={{ scale: 1.02 }}
                              className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 transition-all duration-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                              required
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <motion.label
                          initial={formData.message ? { y: -24, scale: 0.8 } : { y: 0, scale: 1 }}
                          animate={
                            focused === 'message'
                              ? { y: -24, scale: 0.8, color: '#3B82F6' }
                              : formData.message
                              ? { y: -24, scale: 0.8 }
                              : { y: 0, scale: 1 }
                          }
                          transition={{ duration: 0.3, type: 'spring', stiffness: 500 }}
                          className="absolute left-4 text-gray-500 dark:text-gray-400 origin-left pointer-events-none z-10 px-1 bg-white dark:bg-gray-800"
                          style={{ top: 12 }}
                        >
                          Message
                        </motion.label>
                        <motion.textarea
                          name="message"
                          value={formData.message}
                          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                          onFocus={() => setFocused('message')}
                          onBlur={() => setFocused(null)}
                          whileFocus={{ scale: 1.02 }}
                          className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 transition-all duration-300 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 min-h-[200px] resize-none"
                          required
                        />
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 flex justify-between items-center">
                  <motion.button
                    type="button"
                    onClick={() => setActiveSection(activeSection === 0 ? 1 : 0)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 rounded-lg text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {activeSection === 0 ? 'Next' : 'Back'}
                  </motion.button>

                  {activeSection === 1 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
                        isSubmitting
                          ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 hover:shadow-lg hover:shadow-blue-500/20'
                      }`}
                    >
                      <span className="flex items-center">
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </span>
                    </motion.button>
                  )}
                </div>

                <AnimatePresence>
                  {formStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className={`mt-4 p-3 rounded-lg text-center ${
                        formStatusType === 'success'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : formStatusType === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}
                    >
                      {formStatus}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>

            {/* Social Links */}
            <motion.div variants={containerVariants} className="flex justify-center space-x-5 mt-8">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 ${link.color} transition-all duration-300`}
                >
                  {link.icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </main>

        <footer className="relative z-10 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Your Name. All rights reserved.</p>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;