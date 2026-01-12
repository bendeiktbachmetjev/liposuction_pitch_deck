// Wait for DOM to be ready
let zoomText, scrollTrigger, zoomButton, statsSlide, quoteSlide, iconsSlide, questionText, questionPart2, typingCursor, comparisonSlide, comparisonTitle, researchSlide, videoSlide, videoPlayer, graphSlide1, graphSlide2, graphSlide3, satisfactionGraph, precisionGraph, caloriesGraph, ourmarketSlide1, ourmarketSlide2, ourmarketSlide3, competitorsSlide, partnersSlide;

function initElements() {
    zoomText = document.getElementById('zoom-text');
    scrollTrigger = document.querySelector('.scroll-trigger');
    zoomButton = document.getElementById('next-button');
    statsSlide = document.getElementById('stats-slide');
    quoteSlide = document.getElementById('quote-slide');
    iconsSlide = document.getElementById('icons-slide');
    questionText = document.getElementById('question-text');
    questionPart2 = document.getElementById('question-part-2');
    typingCursor = document.getElementById('typing-cursor');
    comparisonSlide = document.getElementById('comparison-slide');
    comparisonTitle = document.getElementById('comparison-title');
    researchSlide = document.getElementById('research-slide');
    videoSlide = document.getElementById('video-slide');
    videoPlayer = document.getElementById('video-player');
    graphSlide1 = document.getElementById('graph-slide-1');
    graphSlide2 = document.getElementById('graph-slide-2');
    graphSlide3 = document.getElementById('graph-slide-3');
    satisfactionGraph = document.getElementById('satisfaction-graph');
    precisionGraph = document.getElementById('precision-graph');
    caloriesGraph = document.getElementById('calories-graph');
    ourmarketSlide1 = document.getElementById('ourmarket-slide-1');
    ourmarketSlide2 = document.getElementById('ourmarket-slide-2');
    ourmarketSlide3 = document.getElementById('ourmarket-slide-3');
    competitorsSlide = document.getElementById('competitors-slide');
    partnersSlide = document.getElementById('partners-slide');
    
    if (!zoomText || !scrollTrigger) {
        console.error('Critical elements not found');
        return false;
    }
    return true;
}

// Presentation state
let currentStage = 0; // 0 = title zoom, 1 = stats slide, 2 = icons slide, 3 = typing effect, 4 = comparison chart, 5 = research slide, 6 = video slide, 7 = graph slide 1 (satisfaction), 8 = graph 2 (precision), 9 = graph 3 (calories), 10 = market 1, 11 = market 2, 12 = market 3, 13 = competitors, 14 = partners, 15 = quote slide
let typingStarted = false;
let typingCompleted = false;
let isTransitioning = false;
let chartAnimated = false;

const MAX_SCALE = 60; // Increased for more zoom
const HIDE_PROGRESS = 0.95;
const TEXT_FADE_START = 0.35; // When text starts fading out
const TEXT_FADE_END = 0.42; // When text completely disappears
// Uniform scroll ranges: each slide gets approximately equal progress range (~0.054-0.055)
// This ensures consistent scroll distance needed to transition between slides
// Total range: 0.40 to 1.0 = 0.60, distributed across 11 slides ≈ 0.0545 per slide
const STATS_REVEAL_START = 0.40; // Stats slide appears
const STATS_REVEAL_END = 0.50; // Stats slide ends (0.10 range - slightly larger for zoom transition)
const ICONS_REVEAL_START = 0.50; // Icons appear after stats
const ICONS_REVEAL_END = 0.555; // Icons slide ends (0.055 range)
const COMPARISON_REVEAL_START = 0.555; // Comparison chart appears
const COMPARISON_REVEAL_END = 0.61; // Comparison chart ends (0.055 range)
const RESEARCH_REVEAL_START = 0.61; // Research slide appears
const RESEARCH_REVEAL_END = 0.665; // Research slide ends (0.055 range)
const VIDEO_REVEAL_START = 0.665; // Video slide appears
const VIDEO_REVEAL_END = 0.72; // Video slide ends (0.055 range)
const GRAPH1_REVEAL_START = 0.72; // First graph slide appears
const GRAPH1_REVEAL_END = 0.775; // First graph slide ends (0.055 range)
const GRAPH2_REVEAL_START = 0.775; // Second graph slide appears
const GRAPH2_REVEAL_END = 0.83; // Second graph slide ends (0.055 range)
const GRAPH3_REVEAL_START = 0.83; // Third graph slide appears
const GRAPH3_REVEAL_END = 0.885; // Third graph slide ends (0.055 range)
const OURMARKET1_REVEAL_START = 0.885; // First market slide (TAM) appears
const OURMARKET1_REVEAL_END = 0.94; // First market slide ends (0.055 range)
const OURMARKET2_REVEAL_START = 0.94; // Second market slide (SAM) appears
const OURMARKET2_REVEAL_END = 0.95; // Second market slide ends (0.01 range)
const OURMARKET3_REVEAL_START = 0.95; // Third market slide (SOM) appears
const OURMARKET3_REVEAL_END = 0.955; // Third market slide ends (0.005 range - shorter, fast transition)
const COMPETITORS_REVEAL_START = 0.955; // Our Competitors slide appears
const COMPETITORS_REVEAL_END = 0.975; // Our Competitors slide ends (0.02 range)
const PARTNERS_REVEAL_START = 0.975; // Nord Clinic Partners slide appears
const PARTNERS_REVEAL_END = 0.995; // Nord Clinic Partners slide ends (0.02 range)
const QUOTE_REVEAL_START = 0.995; // Quote slide appears
const QUOTE_REVEAL_END = 1.0; // Quote slide ends (0.005 range)

function smoothScroll(distance) {
    return new Promise((resolve) => {
        if (distance <= 0) {
            resolve();
            return;
        }

        const startPosition = window.pageYOffset;
        const duration = Math.min(Math.max(distance * 3, 1500), 3200);
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const t = Math.min(progress / duration, 1);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            window.scrollTo(0, startPosition + distance * ease);

            if (progress < duration) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(step);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (initElements()) {
            setupEventListeners();
        }
    });
} else {
    if (initElements()) {
        setupEventListeners();
    }
}

function setupEventListeners() {
    if (zoomButton) {
zoomButton.addEventListener('click', () => {
    if (isTransitioning) return;
    
    if (currentStage === 0) {
                // Stage 0: Zoom to stats slide
        isTransitioning = true;
                // Stop in the middle of stats range, not at the end
                const statsRange = STATS_REVEAL_END - STATS_REVEAL_START;
                const targetProgress = STATS_REVEAL_START + (statsRange * 0.4); // Middle of stats range
        const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
        const targetScroll = targetProgress * triggerHeight;
        const distance = targetScroll - window.scrollY;
        
        smoothScroll(distance).then(() => {
            currentStage = 1;
            isTransitioning = false;
            // Animate stats graph when slide becomes visible
            setTimeout(() => {
                animateStatsGraph();
            }, 500);
        });
    } else if (currentStage === 1) {
                // Stage 1: Transition to icons slide (question)
                isTransitioning = true;
                const targetProgress = ICONS_REVEAL_START + 0.05; // Show icons slide
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 2;
                    isTransitioning = false;
                });
            } else if (currentStage === 2) {
                // Stage 2: Start typing effect
        if (!typingStarted) {
            typingStarted = true;
            startTypingEffect();
                    currentStage = 3;
        }
            } else if (currentStage === 3) {
                // Stage 3: Transition to comparison chart
        if (typingCompleted && !isTransitioning) {
            isTransitioning = true;
                    const targetProgress = COMPARISON_REVEAL_START + 0.05; // Show comparison chart
                    const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                    const targetScroll = targetProgress * triggerHeight;
                    const distance = targetScroll - window.scrollY;
                    
                    smoothScroll(distance).then(() => {
                        currentStage = 4;
                        isTransitioning = false;
                        setTimeout(() => {
                            animateChart();
                        }, 300);
                    });
                }
            } else if (currentStage === 4) {
                // Stage 4: Transition to research slide
                isTransitioning = true;
                const targetProgress = RESEARCH_REVEAL_START + 0.02; // Show research slide near the start
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 5;
                    isTransitioning = false;
                    setTimeout(() => {
                        animateResearchChart();
                    }, 300);
                });
            } else if (currentStage === 5) {
                // Stage 5: Transition to video slide
                isTransitioning = true;
                // Use a position closer to the start of video range, not too close to the end
                const targetProgress = VIDEO_REVEAL_START + 0.02; // Show video slide near the start
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 6;
                    isTransitioning = false;
                    // Video will be played by handleScroll when slide becomes visible
                });
            } else if (currentStage === 6) {
                // Stage 6: Transition from video slide to first graph slide
                isTransitioning = true;
                const targetProgress = GRAPH1_REVEAL_START + 0.02; // Show first graph slide
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 7;
                    isTransitioning = false;
                    // Animate first graph when slide becomes visible
                setTimeout(() => {
                        if (satisfactionGraph) {
                            satisfactionGraph.classList.add('visible');
                            animateGraph('satisfaction');
                        }
                }, 300);
                });
            } else if (currentStage === 7) {
                // Stage 7: Transition to second graph slide
                isTransitioning = true;
                const targetProgress = GRAPH2_REVEAL_START + 0.02; // Show second graph slide
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 8;
                    isTransitioning = false;
                    // Animate second graph when slide becomes visible
                    setTimeout(() => {
                        if (precisionGraph) {
                            precisionGraph.classList.add('visible');
                            animateGraph('precision');
                        }
                    }, 300);
                });
            } else if (currentStage === 8) {
                // Stage 8: Transition to third graph slide
                isTransitioning = true;
                const targetProgress = GRAPH3_REVEAL_START + 0.02; // Show third graph slide
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 9;
                    isTransitioning = false;
                    // Animate third graph when slide becomes visible
            setTimeout(() => {
                        if (caloriesGraph) {
                            caloriesGraph.classList.add('visible');
                            animateGraph('calories');
                        }
                    }, 300);
                });
            } else if (currentStage === 9) {
                // Stage 9: Transition to first market slide (TAM)
                isTransitioning = true;
                const targetProgress = OURMARKET1_REVEAL_START + 0.01; // Show first market slide
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 10;
                    isTransitioning = false;
                    // Animate TAM bar when slide becomes visible
                    setTimeout(() => {
                        animateMarketBar('tam');
                    }, 300);
                });
            } else if (currentStage === 10) {
                // Stage 10: Transition to second market slide (SAM)
                isTransitioning = true;
                const targetProgress = OURMARKET2_REVEAL_START + 0.01; // Show second market slide
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 11;
                    isTransitioning = false;
                    // Animate SAM bar when slide becomes visible
                    setTimeout(() => {
                        animateMarketBar('sam');
                    }, 300);
                });
            } else if (currentStage === 11) {
                // Stage 11: Transition to third market slide (SOM)
                isTransitioning = true;
                // Stop in the middle of SOM range (which is very small, so use start + tiny offset)
                const somRange = OURMARKET3_REVEAL_END - OURMARKET3_REVEAL_START;
                const targetProgress = OURMARKET3_REVEAL_START + (somRange * 0.5); // Middle of SOM range
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 12;
                    isTransitioning = false;
                    // Animate SOM bar when slide becomes visible
            setTimeout(() => {
                        animateMarketBar('som');
                    }, 300);
                });
            } else if (currentStage === 12) {
                // Stage 12: Transition to competitors slide
                isTransitioning = true;
                // Stop in the middle of competitors range
                const competitorsRange = COMPETITORS_REVEAL_END - COMPETITORS_REVEAL_START;
                const targetProgress = COMPETITORS_REVEAL_START + (competitorsRange * 0.4); // Middle of competitors range
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 13;
                    isTransitioning = false;
                });
            } else if (currentStage === 13) {
                // Stage 13: Transition to partners slide
                isTransitioning = true;
                // Stop in the middle of partners range
                const partnersRange = PARTNERS_REVEAL_END - PARTNERS_REVEAL_START;
                const targetProgress = PARTNERS_REVEAL_START + (partnersRange * 0.4); // Middle of partners range
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 14;
                    isTransitioning = false;
                });
            } else if (currentStage === 14) {
                // Stage 14: Transition to quote slide
                isTransitioning = true;
                // Stop in the middle of quote slide range for full brightness
                const quoteRange = QUOTE_REVEAL_END - QUOTE_REVEAL_START;
                const targetProgress = QUOTE_REVEAL_START + (quoteRange * 0.4); // Middle of quote slide range
                const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
                const targetScroll = targetProgress * triggerHeight;
                const distance = targetScroll - window.scrollY;
                
                smoothScroll(distance).then(() => {
                    currentStage = 15;
                    isTransitioning = false;
                });
                }
        });
    }
    
    // Setup scroll listener
    window.addEventListener('scroll', handleScroll);
}

// Base font size in viewport units
const BASE_FONT_SIZE = 5.5; // 5.5vw

function handleScroll() {
    if (!scrollTrigger || !zoomText) return; // Safety check

    const scrollY = window.scrollY;
    const triggerHeight = scrollTrigger.offsetHeight - window.innerHeight;
    if (triggerHeight <= 0) return; // Safety check
    
    let progress = scrollY / triggerHeight;
    progress = Math.min(Math.max(progress, 0), 1);

    // Calculate scale factor for text zoom
    const scale = 1 + Math.pow(progress, 2.1) * MAX_SCALE;
    
    // Calculate new font size dynamically instead of using transform scale
    // This forces browser to re-render text at each size, eliminating pixelation
    const newFontSize = BASE_FONT_SIZE * scale;
    
    // Text fade and blur - complete fade out (works in both directions)
    let textOpacity = 1;
    let blur = 0;

    if (progress > TEXT_FADE_START) {
        const fadeRange = TEXT_FADE_END - TEXT_FADE_START;
        const fadeProgress = Math.min((progress - TEXT_FADE_START) / fadeRange, 1);
        textOpacity = Math.max(0, 1 - fadeProgress); // Ensure it goes to 0
        blur = fadeProgress * 40; // Increased blur for complete disappearance
    }

    // Stats slide reveal (works in both directions)
    let statsOpacity = 0;
    let statsScale = 0.95;
    
    if (progress >= STATS_REVEAL_START && progress < STATS_REVEAL_END) {
        const statsProgress = (progress - STATS_REVEAL_START) / (STATS_REVEAL_END - STATS_REVEAL_START);
        // Reach full opacity quickly (by 30% of the range)
        if (statsProgress >= 0.3) {
            statsOpacity = 1;
        } else {
            statsOpacity = statsProgress / 0.3; // Fade in quickly
        }
        statsScale = 0.95 + (statsProgress * 0.05);
    } else if (progress >= STATS_REVEAL_END) {
        statsOpacity = 1; // Full opacity when past the range
    }

    // Icons reveal - after stats slide (works in both directions)
    let iconsOpacity = 1; // Always full brightness when in range
    let iconsScale = 0.75;
    
    if (progress >= ICONS_REVEAL_START && progress < ICONS_REVEAL_END) {
        const iconsProgress = (progress - ICONS_REVEAL_START) / (ICONS_REVEAL_END - ICONS_REVEAL_START);
        // Full opacity immediately - no fade
        iconsOpacity = 1;
        iconsScale = 0.75 + (iconsProgress * 0.25); // Start from larger scale, less zoom needed
    } else if (progress < ICONS_REVEAL_START) {
        iconsOpacity = 0; // Hidden before range
    }

    // Comparison chart reveal (works in both directions)
    let comparisonOpacity = 0;
    let comparisonScale = 1.0; // Fixed scale, no scaling
    
    if (progress >= COMPARISON_REVEAL_START && progress < COMPARISON_REVEAL_END) {
        const comparisonProgress = (progress - COMPARISON_REVEAL_START) / (COMPARISON_REVEAL_END - COMPARISON_REVEAL_START);
        // Reach full opacity quickly (by 30% of the range)
        if (comparisonProgress >= 0.3) {
            comparisonOpacity = 1;
        } else {
            comparisonOpacity = comparisonProgress / 0.3; // Fade in quickly
        }
    } else if (progress >= COMPARISON_REVEAL_END) {
        comparisonOpacity = 1; // Full opacity when past the range
    }

    // Research slide reveal (works in both directions)
    let researchOpacity = 0;
    let researchScale = 1.0;
    
    if (progress >= RESEARCH_REVEAL_START && progress < RESEARCH_REVEAL_END) {
        const researchProgress = (progress - RESEARCH_REVEAL_START) / (RESEARCH_REVEAL_END - RESEARCH_REVEAL_START);
        // Reach full opacity quickly (by 30% of the range)
        if (researchProgress >= 0.3) {
            researchOpacity = 1;
        } else {
            researchOpacity = researchProgress / 0.3; // Fade in quickly
        }
    } else if (progress >= RESEARCH_REVEAL_END) {
        researchOpacity = 1; // Full opacity when past the range
    }

    // Video slide reveal (works in both directions)
    let videoOpacity = 1; // Always full brightness when in range
    let videoScale = 1.0;
    
    if (progress >= VIDEO_REVEAL_START && progress < VIDEO_REVEAL_END) {
        videoOpacity = 1; // Full opacity immediately
    } else if (progress < VIDEO_REVEAL_START) {
        videoOpacity = 0; // Hidden before range
    }

    // Graph slides reveal (works in both directions)
    let graph1Opacity = 1; // Always full brightness when in range
    let graph2Opacity = 1;
    let graph3Opacity = 1;
    
    if (progress >= GRAPH1_REVEAL_START && progress < GRAPH1_REVEAL_END) {
        graph1Opacity = 1; // Full opacity immediately
    } else if (progress < GRAPH1_REVEAL_START) {
        graph1Opacity = 0; // Hidden before range
    } else {
        graph1Opacity = 0; // Hidden after range
    }
    
    if (progress >= GRAPH2_REVEAL_START && progress < GRAPH2_REVEAL_END) {
        graph2Opacity = 1; // Full opacity immediately
    } else {
        graph2Opacity = 0; // Hidden outside range
    }
    
    if (progress >= GRAPH3_REVEAL_START && progress < GRAPH3_REVEAL_END) {
        graph3Opacity = 1; // Full opacity immediately
    } else {
        graph3Opacity = 0; // Hidden outside range
    }

    // OurMarket slides reveal (works in both directions)
    let ourmarket1Opacity = 1; // Always full brightness when in range
    let ourmarket2Opacity = 1;
    let ourmarket3Opacity = 1;
    
    if (progress >= OURMARKET1_REVEAL_START && progress < OURMARKET1_REVEAL_END) {
        ourmarket1Opacity = 1; // Full opacity immediately
    } else {
        ourmarket1Opacity = 0; // Hidden outside range
    }
    
    if (progress >= OURMARKET2_REVEAL_START && progress < OURMARKET2_REVEAL_END) {
        ourmarket2Opacity = 1; // Full opacity immediately
    } else {
        ourmarket2Opacity = 0; // Hidden outside range
    }
    
    if (progress >= OURMARKET3_REVEAL_START && progress < OURMARKET3_REVEAL_END) {
        ourmarket3Opacity = 1; // Full opacity immediately
    } else {
        ourmarket3Opacity = 0; // Hidden outside range
    }

    // Competitors slide reveal (works in both directions)
    let competitorsOpacity = 1; // Always full brightness when in range
    
    if (progress >= COMPETITORS_REVEAL_START && progress < COMPETITORS_REVEAL_END) {
        competitorsOpacity = 1; // Full opacity immediately
    } else {
        competitorsOpacity = 0; // Hidden outside range
    }

    // Partners slide reveal (works in both directions)
    let partnersOpacity = 1; // Always full brightness when in range
    
    if (progress >= PARTNERS_REVEAL_START && progress < PARTNERS_REVEAL_END) {
        partnersOpacity = 1; // Full opacity immediately
    } else {
        partnersOpacity = 0; // Hidden outside range
    }

    // Quote slide reveal (works in both directions)
    let quoteOpacity = 1; // Always full brightness when in range
    let quoteScale = 1.0;
    
    if (progress >= QUOTE_REVEAL_START && progress < QUOTE_REVEAL_END) {
        quoteOpacity = 1; // Full opacity immediately when in range
        const quoteProgress = (progress - QUOTE_REVEAL_START) / (QUOTE_REVEAL_END - QUOTE_REVEAL_START);
        quoteScale = 0.95 + (quoteProgress * 0.05);
    } else if (progress >= QUOTE_REVEAL_END) {
        quoteOpacity = 1; // Full opacity when past the range
        quoteScale = 1.0;
    } else {
        quoteOpacity = 0; // Hidden before range
    }

    // Determine slide areas
    const isInStatsArea = progress >= STATS_REVEAL_START && progress < STATS_REVEAL_END;
    const isInIconsArea = progress >= ICONS_REVEAL_START && progress < ICONS_REVEAL_END;
    const isInComparisonArea = progress >= COMPARISON_REVEAL_START && progress < COMPARISON_REVEAL_END;
    const isInResearchArea = progress >= RESEARCH_REVEAL_START && progress < RESEARCH_REVEAL_END;
    const isInVideoArea = progress >= VIDEO_REVEAL_START && progress < VIDEO_REVEAL_END;
    const isInGraph1Area = progress >= GRAPH1_REVEAL_START && progress < GRAPH1_REVEAL_END;
    const isInGraph2Area = progress >= GRAPH2_REVEAL_START && progress < GRAPH2_REVEAL_END;
    const isInGraph3Area = progress >= GRAPH3_REVEAL_START && progress < GRAPH3_REVEAL_END;
    const isInGraphArea = isInGraph1Area || isInGraph2Area || isInGraph3Area;
    const isInOurmarket1Area = progress >= OURMARKET1_REVEAL_START && progress < OURMARKET1_REVEAL_END;
    const isInOurmarket2Area = progress >= OURMARKET2_REVEAL_START && progress < OURMARKET2_REVEAL_END;
    const isInOurmarket3Area = progress >= OURMARKET3_REVEAL_START && progress < OURMARKET3_REVEAL_END;
    const isInOurmarketArea = isInOurmarket1Area || isInOurmarket2Area || isInOurmarket3Area;
    const isInCompetitorsArea = progress >= COMPETITORS_REVEAL_START && progress < COMPETITORS_REVEAL_END;
    const isInPartnersArea = progress >= PARTNERS_REVEAL_START && progress < PARTNERS_REVEAL_END;
    const isInQuoteArea = progress >= QUOTE_REVEAL_START && progress < QUOTE_REVEAL_END;

    requestAnimationFrame(() => {
        // Update text (works in both directions)
        if (zoomText) {
        zoomText.style.fontSize = `${newFontSize}vw`;
        zoomText.style.opacity = textOpacity;
        zoomText.style.filter = `blur(${blur}px)`;
        }

        // Update stats slide (works in both directions)
        if (statsSlide) {
            if (isInStatsArea && !isInIconsArea && !isInComparisonArea && !isInQuoteArea) {
                statsSlide.classList.add('visible');
                statsSlide.style.opacity = statsOpacity;
                statsSlide.style.transform = `translateY(0) scale(${statsScale})`;
            } else {
                statsSlide.classList.remove('visible');
                statsSlide.style.opacity = 0;
                statsSlide.style.transform = 'translateY(40px) scale(0.95)';
            }
        }

        // Update icons and question (works in both directions)
        if (iconsSlide) {
            if (isInIconsArea && !isInComparisonArea && !isInVideoArea && !isInQuoteArea) {
                iconsSlide.classList.add('visible');
                iconsSlide.style.opacity = iconsOpacity;
                iconsSlide.style.transform = `scale(${iconsScale})`;
                
                // Animate question text sliding down - very fast, full brightness immediately
                if (questionText) {
                    const questionProgress = Math.min((progress - ICONS_REVEAL_START) / 0.05, 1); // Faster appearance
                    const questionTranslateY = -60 * (1 - questionProgress);
                    questionText.style.opacity = 1; // Always full brightness when visible
                    questionText.style.transform = `translateY(${questionTranslateY}px)`;
                }
            } else {
                iconsSlide.classList.remove('visible');
                iconsSlide.style.opacity = 0;
                iconsSlide.style.transform = 'scale(0.5)';
                
                if (questionText) {
                    questionText.style.opacity = 0;
                    questionText.style.transform = 'translateY(-80px)';
                }
                
                // Reset typing state when scrolling back
                if (progress < ICONS_REVEAL_START) {
                    if (progress < STATS_REVEAL_START) {
                currentStage = 0;
                    } else {
                        currentStage = 1;
                    }
                typingStarted = false;
                typingCompleted = false;
                if (questionPart2) {
                    questionPart2.textContent = '';
                }
                if (typingCursor) {
                    typingCursor.classList.remove('hidden');
                }
                } else if (progress < COMPARISON_REVEAL_START) {
                    currentStage = 2;
                } else if (progress < COMPARISON_REVEAL_START) {
                    currentStage = 2;
                } else if (progress < RESEARCH_REVEAL_START) {
                    currentStage = 4;
                } else if (progress >= RESEARCH_REVEAL_START && progress < VIDEO_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 5; // On research slide, can transition to video
                    }
                } else if (progress >= VIDEO_REVEAL_START && progress < GRAPH1_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 6; // On video slide, can transition to first graph
                    }
                } else if (progress >= GRAPH1_REVEAL_START && progress < GRAPH2_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 7; // On first graph slide
                    }
                } else if (progress >= GRAPH2_REVEAL_START && progress < GRAPH3_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 8; // On second graph slide
                    }
                } else if (progress >= GRAPH3_REVEAL_START && progress < OURMARKET1_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 9; // On third graph slide
                    }
                } else if (progress >= OURMARKET1_REVEAL_START && progress < OURMARKET2_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 10; // On first market slide
                    }
                } else if (progress >= OURMARKET2_REVEAL_START && progress < OURMARKET3_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 11; // On second market slide
                    }
                } else if (progress >= OURMARKET3_REVEAL_START && progress < COMPETITORS_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 12; // On third market slide
                    }
                } else if (progress >= COMPETITORS_REVEAL_START && progress < PARTNERS_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 13; // On competitors slide
                    }
                } else if (progress >= PARTNERS_REVEAL_START && progress < QUOTE_REVEAL_START) {
                    // Only update currentStage if not transitioning
                    if (!isTransitioning) {
                        currentStage = 14; // On partners slide
                    }
                } else {
                    if (!isTransitioning) {
                        currentStage = 15; // On quote slide
                    }
                }
            }
        }

        // Update comparison slide (works in both directions)
        if (comparisonSlide) {
            if (isInComparisonArea && !isInResearchArea && !isInVideoArea && !isInQuoteArea) {
                comparisonSlide.classList.add('visible');
                comparisonSlide.style.opacity = comparisonOpacity;
                comparisonSlide.style.transform = 'translateY(0) scale(1)'; // Fixed scale, no scaling
            } else {
                comparisonSlide.classList.remove('visible');
                comparisonSlide.style.opacity = 0;
                comparisonSlide.style.transform = 'translateY(40px) scale(0.95)';
            }
        }

        // Update research slide (works in both directions)
        if (researchSlide) {
            if (isInResearchArea && !isInVideoArea && !isInQuoteArea) {
                researchSlide.classList.add('visible');
                researchSlide.style.opacity = researchOpacity;
                researchSlide.style.transform = 'translateY(0) scale(1)';
            } else {
                researchSlide.classList.remove('visible');
                researchSlide.style.opacity = 0;
                researchSlide.style.transform = 'translateY(40px) scale(0.95)';
            }
        }

        // Update video slide (works in both directions)
        if (videoSlide) {
            if (isInVideoArea && !isInResearchArea && !isInGraphArea && !isInOurmarketArea && !isInQuoteArea) {
                videoSlide.classList.add('visible');
                videoSlide.style.opacity = videoOpacity;
                videoSlide.style.transform = 'translateY(0) scale(1)';
                // Play video when visible and ensure it's loaded
                if (videoPlayer) {
                    if (videoPlayer.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                        videoPlayer.play().catch(e => console.log('Video play error:', e));
                    } else {
                        // Wait for video to load before playing
                        videoPlayer.addEventListener('loadeddata', () => {
                            videoPlayer.play().catch(e => console.log('Video play error:', e));
                        }, { once: true });
                        videoPlayer.load();
                    }
                }
            } else {
                videoSlide.classList.remove('visible');
                videoSlide.style.opacity = 0;
                videoSlide.style.transform = 'translateY(40px) scale(0.95)';
                // Pause and reset video when not visible
                if (videoPlayer) {
                    videoPlayer.pause();
                    videoPlayer.currentTime = 0; // Reset to beginning
                }
            }
        }

        // Update graph slides (works in both directions)
        if (graphSlide1) {
            if (isInGraph1Area && !isInGraph2Area && !isInGraph3Area && !isInOurmarketArea && !isInQuoteArea) {
                graphSlide1.classList.add('visible');
                graphSlide1.style.opacity = graph1Opacity;
                graphSlide1.style.transform = 'translateY(0) scale(1)';
            } else {
                graphSlide1.classList.remove('visible');
                graphSlide1.style.opacity = 0;
                graphSlide1.style.transform = 'translateY(40px) scale(0.95)';
            }
        }
        
        if (graphSlide2) {
            if (isInGraph2Area && !isInGraph3Area && !isInOurmarketArea && !isInQuoteArea) {
                graphSlide2.classList.add('visible');
                graphSlide2.style.opacity = graph2Opacity;
                graphSlide2.style.transform = 'translateY(0) scale(1)';
            } else {
                graphSlide2.classList.remove('visible');
                graphSlide2.style.opacity = 0;
                graphSlide2.style.transform = 'translateY(40px) scale(0.95)';
            }
        }
        
        if (graphSlide3) {
            if (isInGraph3Area && !isInOurmarketArea && !isInCompetitorsArea && !isInQuoteArea) {
                graphSlide3.classList.add('visible');
                graphSlide3.style.opacity = graph3Opacity;
                graphSlide3.style.transform = 'translateY(0) scale(1)';
            } else {
                graphSlide3.classList.remove('visible');
                graphSlide3.style.opacity = 0;
                graphSlide3.style.transform = 'translateY(40px) scale(0.95)';
            }
        }

        // Update OurMarket slides (works in both directions)
        if (ourmarketSlide1) {
            if (isInOurmarket1Area && !isInOurmarket2Area && !isInOurmarket3Area && !isInCompetitorsArea && !isInQuoteArea) {
                ourmarketSlide1.classList.add('visible');
                ourmarketSlide1.style.opacity = ourmarket1Opacity;
                ourmarketSlide1.style.transform = 'translateY(0) scale(1)';
            } else {
                ourmarketSlide1.classList.remove('visible');
                ourmarketSlide1.style.opacity = 0;
                ourmarketSlide1.style.transform = 'translateY(40px) scale(0.95)';
            }
        }
        
        if (ourmarketSlide2) {
            if (isInOurmarket2Area && !isInOurmarket3Area && !isInCompetitorsArea && !isInQuoteArea) {
                ourmarketSlide2.classList.add('visible');
                ourmarketSlide2.style.opacity = ourmarket2Opacity;
                ourmarketSlide2.style.transform = 'translateY(0) scale(1)';
            } else {
                ourmarketSlide2.classList.remove('visible');
                ourmarketSlide2.style.opacity = 0;
                ourmarketSlide2.style.transform = 'translateY(40px) scale(0.95)';
            }
        }
        
        if (ourmarketSlide3) {
            if (isInOurmarket3Area && !isInCompetitorsArea && !isInPartnersArea && !isInQuoteArea) {
                ourmarketSlide3.classList.add('visible');
                ourmarketSlide3.style.opacity = ourmarket3Opacity;
                ourmarketSlide3.style.transform = 'translateY(0) scale(1)';
            } else {
                ourmarketSlide3.classList.remove('visible');
                ourmarketSlide3.style.opacity = 0;
                ourmarketSlide3.style.transform = 'translateY(40px) scale(0.95)';
            }
        }

        // Update competitors slide (works in both directions)
        if (competitorsSlide) {
            if (isInCompetitorsArea && !isInPartnersArea && !isInQuoteArea) {
                competitorsSlide.classList.add('visible');
                competitorsSlide.style.opacity = competitorsOpacity;
                competitorsSlide.style.transform = 'translateY(0) scale(1)';
            } else {
                competitorsSlide.classList.remove('visible');
                competitorsSlide.style.opacity = 0;
                competitorsSlide.style.transform = 'translateY(40px) scale(0.95)';
            }
        }

        // Update partners slide (works in both directions)
        if (partnersSlide) {
            if (isInPartnersArea && !isInQuoteArea) {
                partnersSlide.classList.add('visible');
                partnersSlide.style.opacity = partnersOpacity;
                partnersSlide.style.transform = 'translateY(0) scale(1)';
            } else {
                partnersSlide.classList.remove('visible');
                partnersSlide.style.opacity = 0;
                partnersSlide.style.transform = 'translateY(40px) scale(0.95)';
            }
        }

        // Update quote slide (works in both directions)
        if (quoteSlide) {
            if (isInQuoteArea) {
                quoteSlide.classList.add('visible');
                quoteSlide.style.opacity = quoteOpacity;
                quoteSlide.style.transform = `translateY(0) scale(${quoteScale})`;
            } else {
                quoteSlide.classList.remove('visible');
                quoteSlide.style.opacity = 0;
                quoteSlide.style.transform = 'translateY(40px) scale(0.95)';
            }
        }

        // Update button (works in both directions)
        if (zoomButton) {
            // Hide button only when we're past the quote slide
            if (progress >= QUOTE_REVEAL_END) {
            zoomButton.classList.add('hidden');
        } else {
            zoomButton.classList.remove('hidden');
            }
        }
    });
}

// Typing effect function
function startTypingEffect() {
    if (!questionPart2 || typingCompleted) return;
    
    const textToType = 'More of ';
    let currentIndex = 0;
    
    // Wait a bit before starting to type
    setTimeout(() => {
        const typeChar = () => {
            if (currentIndex < textToType.length) {
                questionPart2.textContent += textToType[currentIndex];
                currentIndex++;
                setTimeout(typeChar, 150); // Slower typing speed
            } else {
                // Hide cursor after typing is complete
                setTimeout(() => {
                    if (typingCursor) {
                        typingCursor.classList.add('hidden');
                    }
                    typingCompleted = true;
                }, 500);
            }
        };
        
        typeChar();
    }, 500); // Delay before starting to type
}

// Animate chart bars
function animateChart() {
    if (!comparisonSlide) {
        console.error('comparisonSlide not found');
        return;
    }
    
    const MAX_VALUE = 375;
    const chartItems = comparisonSlide.querySelectorAll('.chart-item');
    
    console.log(`Found ${chartItems.length} chart items`);
    
    if (chartItems.length === 0) {
        console.error('No chart items found');
        return;
    }
    
    // Wait for slide to be fully visible and DOM ready
    setTimeout(() => {
        // Get the first wrapper to determine max width
        const firstWrapper = chartItems[0]?.querySelector('.chart-bar-wrapper');
        if (!firstWrapper) {
            console.error('Cannot find wrapper for width calculation');
            return;
        }
        
        // Force layout calculation
        const wrapperWidth = firstWrapper.offsetWidth || firstWrapper.getBoundingClientRect().width;
        
        console.log(`Wrapper width: ${wrapperWidth}px`);
        
        chartItems.forEach((item, index) => {
            const bar = item.querySelector('.chart-bar');
            const value = parseFloat(item.getAttribute('data-value'));
            const color = item.getAttribute('data-color');
            const label = item.getAttribute('data-label');
            
            console.log(`Item ${index}: label="${label}", value=${value}, color=${color}`);
            
            if (bar && !isNaN(value) && value > 0 && wrapperWidth > 0) {
                // Don't set colors - they're handled by CSS
                // Only calculate and set width
                
                // Calculate percentage based on max value
                const percentage = (value / MAX_VALUE) * 100;
                
                // Convert to pixels for precise width
                const widthInPixels = Math.round((wrapperWidth * percentage) / 100);
                
                // Set width with delay for animation
                setTimeout(() => {
                    bar.style.width = `${widthInPixels}px`;
                    console.log(`✓ Bar ${index}: "${label}" = ${value} kcal/h → ${percentage.toFixed(2)}% → ${widthInPixels}px`);
                }, index * 150);
            } else {
                console.error(`✗ Invalid bar ${index}: bar=${!!bar}, value=${value}, wrapperWidth=${wrapperWidth}`);
            }
        });
    }, 800);
    
    chartAnimated = true;
}

// Animate research chart bars
function animateResearchChart() {
    if (!researchSlide) {
        console.error('researchSlide not found');
        return;
    }
    
    const MAX_VALUE = 48; // Maximum value for scaling (SAL has 48 kcal)
    const chartItems = researchSlide.querySelectorAll('.research-chart-item');
    
    console.log(`Found ${chartItems.length} research chart items`);
    
    if (chartItems.length === 0) {
        console.error('No research chart items found');
        return;
    }
    
    // Wait for slide to be fully visible and DOM ready
    setTimeout(() => {
        // Get the first wrapper to determine max width
        const firstWrapper = chartItems[0]?.querySelector('.research-chart-bar-wrapper');
        if (!firstWrapper) {
            console.error('Cannot find wrapper for width calculation');
            return;
        }
        
        // Force layout calculation
        const wrapperWidth = firstWrapper.offsetWidth || firstWrapper.getBoundingClientRect().width;
        
        console.log(`Wrapper width: ${wrapperWidth}px`);
        
        chartItems.forEach((item, index) => {
            const bar = item.querySelector('.research-chart-bar');
            const value = parseFloat(item.getAttribute('data-value'));
            const label = item.getAttribute('data-label');
            
            console.log(`Item ${index}: label="${label}", value=${value}`);
            
            if (bar && !isNaN(value) && value > 0 && wrapperWidth > 0) {
                // Calculate percentage based on max value
                const percentage = (value / MAX_VALUE) * 100;
                
                // Convert to pixels for precise width
                const widthInPixels = Math.round((wrapperWidth * percentage) / 100);
                
                // Set width with delay for animation
                setTimeout(() => {
                    bar.style.width = `${widthInPixels}px`;
                    console.log(`✓ Bar ${index}: "${label}" = ${value} kcal → ${percentage.toFixed(2)}% → ${widthInPixels}px`);
                }, index * 150);
            } else {
                console.error(`✗ Invalid bar ${index}: bar=${!!bar}, value=${value}, wrapperWidth=${wrapperWidth}`);
            }
        });
    }, 800);
}

// Animate statistics graph
function animateStatsGraph() {
    const statsGraphSvg = document.getElementById('stats-graph-svg');
    const statsBars = document.getElementById('stats-bars');
    const statsYearLabels = document.getElementById('stats-year-labels');
    
    if (!statsGraphSvg || !statsBars || !statsYearLabels) return;
    
    // Data: year, value (in thousands), label
    const data = [
        { year: '2005-09', value: 900, label: '800K-1M' },
        { year: '2010', value: 1140, label: '1.14M' },
        { year: '2011', value: 1260, label: '1.26M' },
        { year: '2013', value: 1160, label: '1.16M' },
        { year: '2014', value: 1370, label: '1.37M' },
        { year: '2015', value: 1395, label: '1.40M' },
        { year: '2016', value: 1450, label: '1.45M' },
        { year: '2017', value: 1570, label: '1.57M' },
        { year: '2018', value: 1573, label: '1.57M' },
        { year: '2019', value: 1705, label: '1.71M' },
        { year: '2020', value: 1525, label: '1.53M' },
        { year: '2021', value: 1903, label: '1.90M' },
        { year: '2022', value: 2103, label: '2.10M' },
        { year: '2023', value: 2200, label: '2.20M' },
        { year: '2024', value: 2087, label: '2.09M' },
        { year: '2025', value: 2200, label: '2.20M' }
    ];
    
    const maxValue = 2400; // Max value for scaling
    const svgWidth = 1200;
    const svgHeight = 400;
    const marginLeft = 100; // Increased for Y-axis labels
    const marginRight = 80;
    const marginTop = 50;
    const marginBottom = 50;
    const chartWidth = svgWidth - marginLeft - marginRight;
    const chartHeight = svgHeight - marginTop - marginBottom;
    const barWidth = chartWidth / data.length * 0.7;
    const barSpacing = chartWidth / data.length * 0.3;
    
    // Clear existing bars and labels
    statsBars.innerHTML = '';
    statsYearLabels.innerHTML = '';
    
    // Add Y-axis labels (1M, 2M)
    const yAxisLabels = document.getElementById('stats-y-axis-labels');
    if (!yAxisLabels) {
        const yAxisLabelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        yAxisLabelsGroup.setAttribute('id', 'stats-y-axis-labels');
        yAxisLabelsGroup.setAttribute('class', 'stats-y-axis-labels');
        statsGraphSvg.appendChild(yAxisLabelsGroup);
    } else {
        yAxisLabels.innerHTML = '';
    }
    
    // Create Y-axis labels
    const yAxisValues = [0, 1000, 2000]; // 0, 1M, 2M in thousands
    yAxisValues.forEach((value) => {
        const y = marginTop + chartHeight - (value / maxValue) * chartHeight;
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', marginLeft - 10);
        label.setAttribute('y', y);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('class', 'stats-y-axis-label');
        if (value === 0) {
            label.textContent = '0';
        } else {
            label.textContent = `${value / 1000}M`;
        }
        const yAxisLabelsGroup = document.getElementById('stats-y-axis-labels') || statsGraphSvg.querySelector('.stats-y-axis-labels');
        if (yAxisLabelsGroup) {
            yAxisLabelsGroup.appendChild(label);
        }
    });
    
    // Create bars - each bar gets a color based on its position in the overall gradient
    data.forEach((item, index) => {
        const x = marginLeft + (index * (barWidth + barSpacing)) + (barSpacing / 2);
        const barHeight = (item.value / maxValue) * chartHeight;
        const y = marginTop + chartHeight - barHeight;
        
        // Calculate position in gradient (0 to 1)
        const gradientPosition = index / (data.length - 1);
        
        // Interpolate color based on position
        let color;
        if (gradientPosition <= 0.5) {
            // Between purple and blue
            const t = gradientPosition * 2;
            const r = Math.round(175 + (0 - 175) * t);
            const g = Math.round(82 + (122 - 82) * t);
            const b = Math.round(222 + (255 - 222) * t);
            color = `rgb(${r}, ${g}, ${b})`;
        } else {
            // Between blue and orange
            const t = (gradientPosition - 0.5) * 2;
            const r = Math.round(0 + (255 - 0) * t);
            const g = Math.round(122 + (149 - 122) * t);
            const b = Math.round(255 + (0 - 255) * t);
            color = `rgb(${r}, ${g}, ${b})`;
        }
        
        // Create bar with color based on position
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', marginTop + chartHeight); // Start from bottom
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', 0); // Start with 0 height
        rect.setAttribute('fill', color); // Each bar gets a color based on its position
        rect.setAttribute('rx', 4);
        statsBars.appendChild(rect);
        
        // Animate bar
        setTimeout(() => {
            rect.setAttribute('y', y);
            rect.setAttribute('height', barHeight);
        }, index * 80);
        
        // Create year label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + barWidth / 2);
        text.setAttribute('y', marginTop + chartHeight + 20);
        text.textContent = item.year;
        text.setAttribute('class', 'stats-year-label');
        statsYearLabels.appendChild(text);
    });
}

// Animate individual graph bars
function animateGraph(graphType) {
    setTimeout(() => {
        let graphElement, beforeHeight, afterHeight, beforeY, afterY;
        
        if (graphType === 'satisfaction') {
            graphElement = satisfactionGraph;
            // 68% to 94% - bar heights relative to 100%
            beforeHeight = 80 * 0.68; // 54.4
            afterHeight = 80 * 0.94; // 75.2
            beforeY = 260 - beforeHeight; // 205.6
            afterY = 260 - afterHeight; // 184.8
        } else if (graphType === 'precision') {
            graphElement = precisionGraph;
            // 72% to 96% - bar heights relative to 100%
            beforeHeight = 80 * 0.72; // 57.6
            afterHeight = 80 * 0.96; // 76.8
            beforeY = 260 - beforeHeight; // 202.4
            afterY = 260 - afterHeight; // 183.2
        } else if (graphType === 'calories') {
            graphElement = caloriesGraph;
            // 375 to 213 - inverted (higher = more calories)
            // Scale: max 400 calories = 80px height
            beforeHeight = (375 / 400) * 80; // 75
            afterHeight = (213 / 400) * 80; // 42.6
            beforeY = 260 - beforeHeight; // 185
            afterY = 260 - afterHeight; // 217.4
        }
        
        if (graphElement) {
            const beforeBar = graphElement.querySelector('.bar-before');
            const afterBar = graphElement.querySelector('.bar-after');
            
            if (beforeBar && afterBar) {
                // Animate before bar
                setTimeout(() => {
                    beforeBar.setAttribute('y', beforeY);
                    beforeBar.setAttribute('height', beforeHeight);
                }, 200);
                
                // Animate after bar
                setTimeout(() => {
                    afterBar.setAttribute('y', afterY);
                    afterBar.setAttribute('height', afterHeight);
                }, 600);
            }
        }
    }, 300);
}

// Animate market bar for specific slide
function animateMarketBar(barType) {
    let bar, targetWidth;
    
    if (barType === 'tam') {
        bar = document.getElementById('tam-bar');
        targetWidth = '100%';
    } else if (barType === 'sam') {
        bar = document.getElementById('sam-bar');
        targetWidth = '45%'; // 13,500 / 30,000 = 45%
    } else if (barType === 'som') {
        bar = document.getElementById('som-bar');
        targetWidth = '2.25%'; // 675 / 30,000 = 2.25%
    }
    
    if (!bar) return;
    
    // Reset bar to 0 width first
    bar.style.width = '0';
    
    // Trigger reflow to ensure initial state is applied
    void bar.offsetHeight;
    
    // Animate bar to target width
    setTimeout(() => {
        bar.style.width = targetWidth;
    }, 200);
}
