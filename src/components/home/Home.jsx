import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  FaSortAmountUpAlt, FaSearchPlus, FaNetworkWired, FaBoxOpen, FaBrain, FaShapes,
  FaPlayCircle, FaCode, FaUsers, FaGithub, FaLinkedin, FaTwitter, FaEnvelope,
  FaRocket, FaLightbulb, FaChartLine, FaStar, FaQuoteLeft, FaArrowRight
} from 'react-icons/fa';

const categories = [
  { name: 'Sorting Algorithms', description: 'See how data gets sorted step-by-step.', path: '/BubbleSort', icon: <FaSortAmountUpAlt />, color: '#FF6B6B' },
  { name: 'Searching Algorithms', description: 'Find elements in collections quickly.', path: '/BinarySearch', icon: <FaSearchPlus />, color: '#4ECDC4' },
  { name: 'Graph Algorithms', description: 'Navigate complex networks & connections.', path: '/DijkstraAlgorithm', icon: <FaNetworkWired />, color: '#45B7D1' },
  { name: 'Data Structures', description: 'Explore the building blocks of data.', path: '/binaryTree', icon: <FaBoxOpen />, color: '#96CEB4' },
  { name: 'Dynamic Programming', description: 'Solve problems via sub-solutions.', path: '/LongestCommonSubsequence', icon: <FaBrain />, color: '#FFEAA7' },
  { name: 'Algorithmic Puzzles', description: 'Tackle classic brain-teasing puzzles.', path: '/NQueenProblem', icon: <FaShapes />, color: '#DDA0DD' }
];

const features = [
  { icon: <FaPlayCircle />, title: "Interactive Control", description: "Step through algorithms at your own pace, pause, and rewind.", color: '#FF6B6B' },
  { icon: <FaCode />, title: "Code Previews", description: "See the underlying code alongside the visualization to connect theory and practice.", color: '#4ECDC4' },
  { icon: <FaUsers />, title: "For Everyone", description: "Perfect for students, developers preparing for interviews, and curious minds.", color: '#45B7D1' }
];

const stats = [
  { number: "15+", label: "Algorithms", icon: <FaRocket /> },
  { number: "1000+", label: "Students Helped", icon: <FaUsers /> },
  { number: "50+", label: "Visualizations", icon: <FaChartLine /> },
  { number: "4.9★", label: "User Rating", icon: <FaStar /> }
];

const testimonials = [
  {
    text: "This platform made understanding recursion so much easier! The visual approach is genius.",
    author: "Sarah Chen",
    role: "Computer Science Student",
    avatar: "👩‍💻"
  },
  {
    text: "Perfect for interview prep. I finally understood dynamic programming thanks to these visualizations.",
    author: "Mike Rodriguez",
    role: "Software Engineer",
    avatar: "👨‍💼"
  },
  {
    text: "As an educator, I use this in my classes. Students love the interactive approach!",
    author: "Dr. Emily Watson",
    role: "Professor",
    avatar: "👩‍🏫"
  }
];

const FloatingElement = ({ children, delay = 0 }) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
      rotate: [0, 5, 0, -5, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
    className="floating-element"
  >
    {children}
  </motion.div>
);

const CountUp = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      let startTime = null;
      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / (duration * 1000), 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * parseInt(end));
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [end, duration, isInView, hasAnimated]);

  return <span ref={ref}>{count}{end.includes('+') ? '+' : ''}{end.includes('★') ? '★' : ''}</span>;
};

const Home = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='homeContainer homeBloom'>
      <div className="background-elements">
        <FloatingElement delay={0}>
          <div className="floating-shape shape-1"></div>
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="floating-shape shape-2"></div>
        </FloatingElement>
        <FloatingElement delay={4}>
          <div className="floating-shape shape-3"></div>
        </FloatingElement>
      </div>

      <motion.header 
        className='heroSection'
        style={{ y, opacity }}
      >
        <motion.div 
          className="hero-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className='mainTitle'
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Visualize Algorithms,<br />
            <motion.span
              className="gradient-text"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              Master Concepts
            </motion.span>
          </motion.h1>
          <motion.p 
            className='subTitle'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            An interactive playground to explore the fascinating world of data structures and algorithms.
            <br />Transform your learning experience with cutting-edge visualizations.
          </motion.p>
          
          <motion.div
            className="hero-cta"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link to="/BubbleSort" className="cta-button">
              <span>Start Learning</span>
              <FaArrowRight />
            </Link>
          </motion.div>
        </motion.div>
      </motion.header>

      <motion.section 
        className='statsSection'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className='statsGrid'>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className='statCard'
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">
                <CountUp end={stat.number} />
              </div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className='introduction'
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Why Visualize?</h2>
        <p>
          Abstract concepts become concrete when you see them in action. Our visualizers
          transform complex code into intuitive animations, making learning faster, easier, and more fun.
          Whether you're tackling Big O notation or understanding recursion, seeing it happen makes all the difference.
        </p>
        <motion.div 
          className="introduction-highlight"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <FaLightbulb className="highlight-icon" />
          <span>Learning by visualization increases retention by up to 400%</span>
        </motion.div>
      </motion.section>

      <motion.section 
        className='featuresSection'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Key Features</h2>
        <div className='featuresGrid'>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className='featureCard'
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
              }}
              style={{ '--feature-color': feature.color }}
            >
              <motion.div 
                className='featureIcon'
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                {feature.icon}
              </motion.div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-accent"></div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className='categoriesSection'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Pick Your Challenge</h2>
        <p className="section-subtitle">
          Dive deep into different areas of computer science with our comprehensive collection of visualizations.
        </p>
        <div className='categoriesGrid'>
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link to={category.path} className='categoryCardLink'>
                <motion.div
                  className='categoryCard'
                  whileHover={{ 
                    scale: 1.03,
                    y: -10,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{ '--category-color': category.color }}
                >
                  <motion.div 
                    className='categoryIcon'
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {category.icon}
                  </motion.div>
                  <h3 className='categoryName'>{category.name}</h3>
                  <p className='categoryDescription'>{category.description}</p>
                  <motion.span 
                    className='explore-arrow'
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    →
                  </motion.span>
                  <div className="category-accent"></div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        className='testimonialsSection'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>What Our Users Say</h2>
        <div className="testimonials-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              className="testimonial-card"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <FaQuoteLeft className="quote-icon" />
              <p className="testimonial-text">{testimonials[currentTestimonial].text}</p>
              <div className="testimonial-author">
                <span className="author-avatar">{testimonials[currentTestimonial].avatar}</span>
                <div>
                  <div className="author-name">{testimonials[currentTestimonial].author}</div>
                  <div className="author-role">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>

      <motion.section 
        className='aboutUsSection'
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className='aboutContent'>
          <h2>About Us</h2>
          <p>
            We are a passionate group of developers and educators who believe in the power of visual learning.
            Our mission is to make complex computer science topics accessible and engaging for everyone,
            fostering a deeper understanding and appreciation for the elegance of algorithms and data structures.
          </p>
          <p>
            This project is a labor of love, built to empower the next generation of innovators. 
            We've helped thousands of students ace their technical interviews and understand 
            concepts that once seemed impossible to grasp.
          </p>
          <motion.div 
            className="mission-values"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="value-item">
              <FaLightbulb />
              <span>Innovation in Education</span>
            </div>
            <div className="value-item">
              <FaUsers />
              <span>Community Driven</span>
            </div>
            <div className="value-item">
              <FaRocket />
              <span>Continuous Improvement</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.footer 
        className='siteFooter'
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className='footerContent'>
          <div className='footerLinks'>
            <Link to="/">Home</Link>
            <a href="#" target="_blank" rel="noopener noreferrer">Contribute (GitHub)</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Report Bug</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Contact Us</a>
          </div>
          <motion.div 
            className='socialIcons'
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.a 
              href="#" 
              aria-label="GitHub"
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaGithub />
            </motion.a>
            <motion.a 
              href="#" 
              aria-label="LinkedIn"
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaLinkedin />
            </motion.a>
            <motion.a 
              href="#" 
              aria-label="Twitter"
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTwitter />
            </motion.a>
            <motion.a 
              href="#" 
              aria-label="Email"
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaEnvelope />
            </motion.a>
          </motion.div>
          <div className='footerCopyright'>
            &copy; {new Date().getFullYear()} AlgoVisualizer. Build your foundation.
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;