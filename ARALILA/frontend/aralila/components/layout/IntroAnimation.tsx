'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface IntroAnimationProps {
  onComplete: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const floatVariants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const scaleVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      type: 'spring',
      stiffness: 100,
    },
  },
};

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: 'Welcome to Aralila!',
      subtitle: 'Your Interactive Filipino Learning Journey',
      description: 'Learn Filipino language through fun, interactive games',
      lilaImage: '/images/character/lila-happy.png',
      bgColor: 'from-[#A799B7] to-[#533A71]',
      accent: 'bg-blue-100',
    },
    {
      title: 'Learn Through Games',
      subtitle: 'Master Filipino with Engaging Challenges',
      description: 'Spelling, Punctuation, Grammar, Parts of Speech, and more!',
      lilaImage: '/images/character/lila-pencil.png',
      bgColor: 'from-[#D7BA89] to-[#B8956A]',
      accent: 'bg-pink-100',
    },
    {
      title: 'Earn Rewards',
      subtitle: 'Collect Points and Badges',
      description: 'Build your streak, unlock achievements, and climb the leaderboard',
      lilaImage: '/images/character/lila-stars.png',
      bgColor: 'from-[#A799B7] via-[#8B7BA8] to-[#533A71]',
      accent: 'bg-yellow-100',
    },
    {
      title: 'Track Progress',
      subtitle: 'See Your Growth',
      description: 'Monitor your learning with detailed analytics and insights',
      lilaImage: '/images/character/lila-computer.png',
      bgColor: 'from-[#533A71] to-[#3D2A52]',
      accent: 'bg-green-100',
    },
    {
      title: 'Ready to Begin?',
      subtitle: 'Start Your Adventure Now!',
      description: 'Explore all areas and discover the joy of learning Filipino',
      lilaImage: '/images/character/lila-thumbsup.png',
      bgColor: 'from-[#D7BA89] via-[#A799B7] to-[#533A71]',
      accent: 'bg-indigo-100',
    },
  ];

  useEffect(() => {
    // Ensure we always start at the first slide
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          {/* Animated Background */}
          <motion.div
            key={`bg-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`absolute inset-0 bg-gradient-to-br ${step.bgColor}`}
          />

          {/* Animated Background Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-10 left-10 w-40 h-40 bg-white bg-opacity-10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-10 right-10 w-60 h-60 bg-white bg-opacity-10 rounded-full blur-3xl"
            />
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={`content-${currentStep}`}
              className="w-full max-w-2xl text-center flex flex-col items-center gap-8"
            >
              {/* Lila Character */}
              <motion.div
                variants={scaleVariants}
                className="relative h-56 w-56 sm:h-64 sm:w-64"
              >
                <motion.div
                  animate="animate"
                  variants={floatVariants}
                  className="relative w-full h-full"
                >
                  <Image
                    src={step.lilaImage}
                    alt="Lila Character"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </motion.div>

                {/* Glow effect */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255,255,255,0.3)',
                      '0 0 40px rgba(255,255,255,0.6)',
                      '0 0 20px rgba(255,255,255,0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full"
                />
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants}>
                <h1 className="text-5xl sm:text-6xl font-bold text-white mb-2 drop-shadow-lg">
                  {step.title}
                </h1>
                <p className="text-xl sm:text-2xl text-white text-opacity-90 font-semibold">
                  {step.subtitle}
                </p>
              </motion.div>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-white text-opacity-85 max-w-xl leading-relaxed"
              >
                {step.description}
              </motion.p>

              {/* Progress Indicator */}
              <motion.div variants={itemVariants} className="flex gap-3 mt-4">
                {steps.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-3 rounded-full transition-all cursor-pointer ${
                      index === currentStep
                        ? 'bg-white w-10'
                        : 'bg-white bg-opacity-50 w-3 hover:bg-opacity-70'
                    }`}
                    animate={{
                      width: index === currentStep ? 40 : 12,
                      backgroundColor:
                        index === currentStep
                          ? 'rgba(255,255,255,1)'
                          : 'rgba(255,255,255,0.5)',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex gap-4 justify-center mt-8 w-full flex-wrap sm:flex-nowrap"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSkip}
                  className="px-8 py-3 text-[#533A71] font-semibold rounded-xl bg-white bg-opacity-90 hover:bg-opacity-100 backdrop-blur-md transition-all border border-white border-opacity-50"
                >
                  Skip
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="px-10 py-3 bg-white text-[#533A71] font-bold rounded-xl hover:shadow-2xl transition-all shadow-lg"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 text-white text-4xl font-light hover:text-opacity-70 transition-all drop-shadow-lg"
          >
            ×
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
