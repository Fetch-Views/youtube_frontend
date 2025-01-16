// initialization

const RESPONSIVE_WIDTH = 1024

let headerWhiteBg = false
let isHeaderCollapsed = window.innerWidth < RESPONSIVE_WIDTH
const collapseBtn = document.getElementById("collapse-btn")
const collapseHeaderItems = document.getElementById("collapsed-header-items")

const navToggle = document.querySelector("#nav-dropdown-toggle-0")
const navDropdown = document.querySelector("#nav-dropdown-list-0")


function onHeaderClickOutside(e) {

    if (!collapseHeaderItems.contains(e.target)) {
        toggleHeader()
    }

}


function toggleHeader() {
    if (isHeaderCollapsed) {
        // collapseHeaderItems.classList.remove("max-md:tw-opacity-0")
        collapseHeaderItems.classList.add("max-lg:!tw-opacity-100", "tw-min-h-[90vh]")
        collapseHeaderItems.style.height = "90vh"
        collapseBtn.classList.remove("bi-list")
        collapseBtn.classList.add("bi-x", "max-lg:tw-fixed")
        isHeaderCollapsed = false

        document.body.classList.add("modal-open")

        setTimeout(() => window.addEventListener("click", onHeaderClickOutside), 1)

    } else {
        collapseHeaderItems.classList.remove("max-lg:!tw-opacity-100", "tw-min-h-[90vh]")
        collapseHeaderItems.style.height = "0vh"
        
        collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed")  
        
        collapseBtn.classList.add("bi-list")
        document.body.classList.remove("modal-open")

        isHeaderCollapsed = true
        window.removeEventListener("click", onHeaderClickOutside)

    }
}

/**
 * Animations
 */

const faqAccordion = document.querySelectorAll('.faq-accordion');

faqAccordion.forEach(function (btn) {
    btn.addEventListener('click', function () {
        // Toggle 'active' class for styling purposes
        this.classList.toggle('active');

        // Select the next sibling (the content div)
        let content = this.nextElementSibling;
        let icon = this.querySelector(".bi-plus");

        // Check if maxHeight is set or not
        if (content.style.maxHeight && content.style.maxHeight !== '0px') {
            // Collapse the content
            content.style.maxHeight = '0px';
            content.style.padding = '0px 18px';
            icon.style.transform = "rotate(0deg)";
        } else {
            // Expand the content
            content.style.maxHeight = `${content.scrollHeight}px`;
            content.style.padding = '20px 18px';
            icon.style.transform = "rotate(45deg)";
        }
    });
});




// ------------- reveal section animations ---------------

const sections = gsap.utils.toArray("section")

sections.forEach((sec) => {

    const revealUptimeline = gsap.timeline({paused: true, 
                                            scrollTrigger: {
                                                            trigger: sec,
                                                            start: "10% 80%", // top of trigger hits the top of viewport
                                                            end: "20% 90%",
                                                            // markers: true,
                                                            // scrub: 1,
                                                        }})

    revealUptimeline.to(sec.querySelectorAll(".reveal-up"), {
        opacity: 1,
        duration: 0.8,
        y: "0%",
        stagger: 0.2,
    })


})

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.image-comparison');
    const overlay = document.querySelector('.image-comparison-overlay');
    const slider = document.querySelector('.comparison-slider');
    let isActive = false;

    // Initialiser la position au milieu
    const initializeSlider = () => {
        const clipValue = `inset(0 50% 0 0)`;
        overlay.style.clipPath = clipValue;
        slider.style.left = '50%';
    };

    // Appeler l'initialisation au chargement
    initializeSlider();

    // Fonction pour mettre à jour la position
    const updatePosition = (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.pageX - rect.left;
        const position = Math.max(0, Math.min(x, rect.width));
        const percentage = (position / rect.width) * 100;

        const clipValue = `inset(0 ${100 - percentage}% 0 0)`;
        overlay.style.clipPath = clipValue;
        slider.style.left = `${percentage}%`;
    };

    // Événements souris
    slider.addEventListener('mousedown', (e) => {
        isActive = true;
        // Empêcher la sélection de texte pendant le glissement
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', () => isActive = false);
    document.addEventListener('mousemove', (e) => {
        if (!isActive) return;
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const x = Math.max(rect.left, Math.min(e.pageX, rect.right));
        updatePosition({ pageX: x });
    });

    // Événements tactiles
    slider.addEventListener('touchstart', (e) => {
        isActive = true;
        e.preventDefault();
    });
    
    document.addEventListener('touchend', () => isActive = false);
    document.addEventListener('touchcancel', () => isActive = false);
    document.addEventListener('touchmove', (e) => {
        if (!isActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = Math.max(rect.left, Math.min(touch.pageX, rect.right));
        updatePosition({ pageX: x });
    });
});


