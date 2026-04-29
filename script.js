document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Initialize Lenis for Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP with Lenis
    gsap.registerPlugin(ScrollTrigger);
    
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    // 2. Custom Cursor Logic
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Move inner dot instantly
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    // Animate follower with a delay
    gsap.ticker.add(() => {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        gsap.set(follower, { x: followerX, y: followerY });
    });

    // Hover effects for links and buttons
    const hoverElements = document.querySelectorAll('a, button, .magnetic');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });

    // 3. Magnetic Button Effect
    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const strength = btn.dataset.strength || 20;
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x / rect.width * strength,
                y: y / rect.height * strength,
                duration: 1,
                ease: "power4.out"
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // 4. Initial Load Animations
    const tl = gsap.timeline();
    
    tl.from('nav', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
    })
    .from('.reveal-text', {
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power4.out"
    }, "-=0.5")
    .from('.image-wrapper', {
        x: 100,
        opacity: 0,
        rotationY: -30,
        duration: 1.5,
        ease: "power4.out"
    }, "-=1");

    // 5. About Section Fade Up
    gsap.from('.fade-up', {
        scrollTrigger: {
            trigger: '.about',
            start: "top 80%",
        },
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out"
    });

    // 6. Horizontal Scroll Projects Section
    const projectsWrapper = document.querySelector('.projects-wrapper');
    const projectsContainer = document.querySelector('.projects-container');
    
    // Calculate how far to move to the left
    function getScrollAmount() {
        let projectsWidth = projectsWrapper.scrollWidth;
        return -(projectsWidth - window.innerWidth);
    }

    let mm = gsap.matchMedia();

    // Desktop: GSAP Horizontal Scroll
    mm.add("(min-width: 769px)", () => {
        const tween = gsap.to(projectsWrapper, {
            x: getScrollAmount,
            ease: "none"
        });

        ScrollTrigger.create({
            trigger: ".projects-section",
            start: "top top",
            end: () => `+=${getScrollAmount() * -1}`,
            pin: true,
            animation: tween,
            scrub: 1,
            invalidateOnRefresh: true,
        });

        // Animate project cards inside horizontal scroll
        const projectCards = gsap.utils.toArray('.project-card');
        projectCards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    containerAnimation: tween,
                    start: "left 80%",
                    toggleActions: "play none none reverse",
                },
                y: 50,
                opacity: 0,
                rotation: 5,
                duration: 0.8,
                ease: "power3.out"
            });
        });
    });

    // Mobile: Native Horizontal Swipe
    mm.add("(max-width: 768px)", () => {
        // Just fade in the projects container
        gsap.from('.projects-wrapper', {
            scrollTrigger: {
                trigger: '.projects-section',
                start: "top 80%",
            },
            opacity: 0,
            duration: 1,
        });
    });

    // Background Color shift on scroll (subtle)
    gsap.to('body', {
        scrollTrigger: {
            trigger: '.projects-section',
            start: "top center",
            end: "bottom center",
            scrub: true
        },
        backgroundColor: '#020205', // slightly darker/bluish when reaching projects
    });

});
