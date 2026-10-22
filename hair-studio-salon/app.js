/**
 * HAIR STUDIO SALON - INTERACTIVE CLIENT SIDE LOGIC
 * Location: Model Town, Rewari
 * Author: Antigravity AI pair-programmer
 */

document.addEventListener('DOMContentLoaded', () => {

    // Page Preloader Fade Out
    const loader = document.getElementById('loader');
    if (loader) {
        // Fade out on window load
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('fade-out');
            }, 400);
        });

        // Fallback in case window load event has already fired or is delayed
        setTimeout(() => {
            if (!loader.classList.contains('fade-out')) {
                loader.classList.add('fade-out');
            }
        }, 1500);
    }

    // ==========================================================================
    // 1. GLOBAL STATE & SELECTORS
    // ==========================================================================
    const bookingState = {
        gender: 'men', // 'men' or 'women'
        selectedServices: [], // Array of { id, name }
        stylist: 'any', // 'any', 'marcus', 'elena', 'sasha'
        stylistName: 'Next Available Stylist',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        time: '11:00 AM',
        clientDetails: {
            name: '',
            phone: '',
            email: '',
            notes: ''
        },
        currentStep: 1
    };

    // Quiz State
    let quizAnswers = {
        focus: '',
        concern: '',
        preference: ''
    };

    // DOM Elements - General
    const header = document.getElementById('main-header');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const toastContainer = document.getElementById('toast-container');

    // DOM Elements - Tabs
    const tabBtns = document.querySelectorAll('.tab-toggle-btn');
    const panels = document.querySelectorAll('.services-panel');

    // DOM Elements - Modal Wizard
    const bookingModal = document.getElementById('booking-modal');
    const closeBookingBtn = document.getElementById('close-booking-modal');
    const bookTriggers = document.querySelectorAll('.book-trigger');
    const wizardPanels = document.querySelectorAll('.wizard-panel');
    const wizardIndicatorSteps = document.querySelectorAll('.step-indicator');
    const wizardNextBtn = document.getElementById('wizard-next-btn');
    const wizardBackBtn = document.getElementById('wizard-back-btn');
    const selectedCountText = document.getElementById('selected-count');
    const summaryStylist = document.getElementById('summary-stylist');
    const summaryDatetime = document.getElementById('summary-datetime');
    const summaryServicesList = document.getElementById('summary-services-list');
    const summaryTotal = document.getElementById('summary-total');
    const clientDetailsForm = document.getElementById('booking-details-form');

    // DOM Elements - Booking Wizard Options
    const wizardGenderRadios = document.querySelectorAll('input[name="wizard-gender"]');
    const wizardMenList = document.getElementById('wizard-men-services');
    const wizardWomenList = document.getElementById('wizard-women-services');
    const wizardServiceItems = document.querySelectorAll('.wizard-service-item');
    const calendarDays = document.querySelectorAll('.cal-day:not(.empty)');
    const timeSlotBtns = document.querySelectorAll('.time-slot-btn');

    // DOM Elements - Quiz
    const quizStepPanels = document.querySelectorAll('.quiz-step');
    const quizOptionBtns = document.querySelectorAll('.quiz-option-btn');
    const quizResultCard = document.getElementById('quiz-result-card');
    const resultTitle = document.getElementById('result-title');
    const resultDesc = document.getElementById('result-desc');
    const bookRecommendedBtn = document.getElementById('book-recommended-btn');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');

    // DOM Elements - Testimonials
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const prevTestimonialBtn = document.getElementById('prev-testimonial');
    const nextTestimonialBtn = document.getElementById('next-testimonial');
    const testimonialDots = document.querySelectorAll('.slider-dots .dot');

    // DOM Elements - Footer / Inquiry
    const footerGenderLinks = document.querySelectorAll('[data-gender-select]');
    const inquiryForm = document.getElementById('inquiry-form');
    const newsletterForm = document.getElementById('newsletter-form');


    // ==========================================================================
    // 2. TOAST NOTIFICATION SYSTEM
    // ==========================================================================
    function showToast(message, icon = 'fa-circle-check') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        // Trigger reflow & show
        setTimeout(() => toast.classList.add('show'), 10);

        // Hide and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }


    // ==========================================================================
    // 3. NAVIGATION & INTERACTION
    // ==========================================================================

    // Sticky Header Shrinking & Shadow on scroll
    window.addEventListener('scroll', () => {
        if (header) {
            // If we are on gallery.html, it is pre-scrolled/sticky colored
            if (!header.classList.contains('scrolled') || window.location.pathname.indexOf('gallery.html') === -1) {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        }
        highlightActiveNavLink();
    });

    // Mobile Hamburger Menu Toggle
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close Mobile Drawer on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (hamburgerMenu) hamburgerMenu.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        });
    });

    // Track scroll sections to update Nav active highlights (Only for index.html)
    function highlightActiveNavLink() {
        if (window.location.pathname.indexOf('gallery.html') !== -1) return;
        const scrollPosition = window.scrollY + 120; // offset header

        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}` || link.getAttribute('href') === `index.html#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }


    // ==========================================================================
    // 4. SERVICE MENU TAB SYSTEM
    // ==========================================================================
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                const panel = document.getElementById(tabId);
                if (panel) panel.classList.add('active');
            });
        });
    }

    // Footer links to trigger tab switching
    footerGenderLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const gender = link.getAttribute('data-gender-select');

            if (tabBtns.length > 0 && panels.length > 0) {
                tabBtns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                if (gender === 'men') {
                    const menTab = document.querySelector('[data-tab="mens-services"]');
                    const menPanel = document.getElementById('mens-services');
                    if (menTab) menTab.classList.add('active');
                    if (menPanel) menPanel.classList.add('active');
                } else {
                    const womenTab = document.querySelector('[data-tab="womens-services"]');
                    const womenPanel = document.getElementById('womens-services');
                    if (womenTab) womenTab.classList.add('active');
                    if (womenPanel) womenPanel.classList.add('active');
                }
            } else {
                // If on separate page (gallery.html), allow redirecting to index.html with gender anchor
                window.location.href = `index.html#services`;
            }
        });
    });


    // ==========================================================================
    // 5. TESTIMONIALS SLIDER
    // ==========================================================================
    if (testimonialSlides.length > 0) {
        let activeTestimonialIndex = 0;
        let testimonialInterval = setInterval(nextTestimonial, 5000);

        function showTestimonial(index) {
            testimonialSlides.forEach(slide => slide.classList.remove('active'));
            testimonialDots.forEach(dot => dot.classList.remove('active'));

            testimonialSlides[index].classList.add('active');
            testimonialDots[index].classList.add('active');
            activeTestimonialIndex = index;
        }

        function nextTestimonial() {
            let index = (activeTestimonialIndex + 1) % testimonialSlides.length;
            showTestimonial(index);
        }

        function prevTestimonial() {
            let index = (activeTestimonialIndex - 1 + testimonialSlides.length) % testimonialSlides.length;
            showTestimonial(index);
        }

        if (nextTestimonialBtn) {
            nextTestimonialBtn.addEventListener('click', () => {
                clearInterval(testimonialInterval);
                nextTestimonial();
                testimonialInterval = setInterval(nextTestimonial, 6000);
            });
        }

        if (prevTestimonialBtn) {
            prevTestimonialBtn.addEventListener('click', () => {
                clearInterval(testimonialInterval);
                prevTestimonial();
                testimonialInterval = setInterval(nextTestimonial, 6000);
            });
        }

        testimonialDots.forEach(dot => {
            dot.addEventListener('click', () => {
                clearInterval(testimonialInterval);
                const index = parseInt(dot.getAttribute('data-index'));
                showTestimonial(index);
                testimonialInterval = setInterval(nextTestimonial, 6000);
            });
        });
    }


    // ==========================================================================
    // 6. STYLE DIAGNOSTIC QUIZ LOGIC
    // ==========================================================================
    if (quizOptionBtns.length > 0) {
        quizOptionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const step = parseInt(btn.closest('.quiz-step').getAttribute('data-step'));
                const answer = btn.getAttribute('data-answer');

                if (step === 1) {
                    quizAnswers.focus = answer;
                    goToQuizStep(2, answer);
                } else if (step === 2) {
                    quizAnswers.concern = answer;
                    goToQuizStep(3);
                } else if (step === 3) {
                    quizAnswers.preference = answer;
                    generateQuizResult();
                }
            });
        });
    }

    function goToQuizStep(stepNum, branch = '') {
        if (quizStepPanels.length === 0) return;

        quizStepPanels.forEach(panel => {
            panel.classList.remove('active');
        });

        if (stepNum === 2) {
            const targetPanel = document.querySelector(`.quiz-step[data-step="2"][data-branch="${branch}"]`);
            if (targetPanel) targetPanel.classList.add('active');
        } else {
            const targetPanel = document.querySelector(`.quiz-step[data-step="${stepNum}"]:not([data-branch])`);
            if (targetPanel) targetPanel.classList.add('active');
        }
    }

    const recommendations = {
        'hair-dry': {
            title: "Premium Keratin & Hair Spa Ritual",
            desc: "Your hair suffers from frizz, dryness, or damage. We recommend our intensive Keratin Treatment to smooth cuticle scales, paired with a Deep Conditioning Hair Spa to lock in moisture and natural fats.",
            serviceId: "w-keratin",
            gender: "women",
            serviceName: "Women's Keratin Treatment"
        },
        'hair-thin': {
            title: "Volumizing Spa & Custom Blow Dry",
            desc: "For flat or thin hair looking for body, we suggest our custom Blow Dry & Styling package, combined with a Volumizing Hair Spa and scalp massage to stimulate blood circulation at the root.",
            serviceId: "w-blow",
            gender: "women",
            serviceName: "Blow Dry"
        },
        'hair-dull': {
            title: "Signature Couture Color & Balayage",
            desc: "If you want a vibrant styling refresh or want to replace dull tones, our highlights, contouring, or signature balayage combined with a shine-enhancing Gloss treatment is perfect for you.",
            serviceId: "w-balay",
            gender: "women",
            serviceName: "Highlights & Balayage"
        },
        'hair-scalp': {
            title: "Aromatic Deep Scalp Cleansing Spa",
            desc: "Dealing with itchiness, dandruff, or scalp imbalance? We recommend our specialized Scalp Detoxification Therapy which includes gentle chemical exfoliation, therapeutic wash, and high-frequency massage.",
            serviceId: "m-scalp",
            gender: "men",
            serviceName: "Men's Scalp Treatment"
        },
        'skin-acne': {
            title: "Anti-Acne Purifying Facial & Facial Detox",
            desc: "To manage breakout-prone, oily, or congested skin, our customized Anti-Acne Facial uses deep extraction, salicylic peels, and a soothing charcoal mask to balance sebum production.",
            serviceId: "w-facial",
            gender: "women",
            serviceName: "Women's Facial"
        },
        'skin-aging': {
            title: "Luxury Anti-Aging & Face Polishing Therapy",
            desc: "To counter fine lines, dullness, or loss of skin elasticity, we recommend our Anti-Aging Facial. Packed with active retinoids and peptides, it is paired with micro-dermabrasion Face Polishing to encourage cell renewal.",
            serviceId: "w-facial",
            gender: "women",
            serviceName: "Women's Anti-Aging Facial"
        },
        'skin-glow': {
            title: "Hydrating Brightening Glow Ritual",
            desc: "Ideal for dehydrated, tired, or dry skin types. Our Brightening & Hydrating Facial uses hyaluronic acid serum sheets, vitamin C infusions, and cooling jade roller massages to restore glowing hydration.",
            serviceId: "w-facial",
            gender: "women",
            serviceName: "Brightening Facial"
        },
        'skin-tan': {
            title: "Insta-Detan Cleanup & Polishing Pack",
            desc: "For rapid sun damage repair and tan removal. We use organic kojic acid and milk protein detan treatments, followed by a clarifying herbal cleanup and hydration mist.",
            serviceId: "m-clean",
            gender: "men",
            serviceName: "Cleanup"
        },
        'special-wedding': {
            title: "Elite Pre-Wedding / Bridal Prep Package",
            desc: "Congratulations on your upcoming wedding! Our comprehensive Groom/Bridal packages cover everything from luxury hair spa, custom styling, advanced skin polishing, threading, to makeup styling for your big day.",
            serviceId: "w-bridalk",
            gender: "women",
            serviceName: "Bridal Package"
        },
        'special-party': {
            title: "Signature Party Ready & Makeup Package",
            desc: "For birthdays, anniversaries, or wedding attendance. We provide customized professional party makeup (HD or standard), detailed hair setting, blow dry styling, and nail gel polish.",
            serviceId: "w-ready",
            gender: "women",
            serviceName: "Party Ready Package"
        },
        'special-shoot': {
            title: "HD Airbrush Makeup & Elite Hair Setting",
            desc: "Camera-ready look. Standard HD or Airbrush styling designed to minimize skin imperfections, prevent shine under production lights, and offer long-lasting styling hold.",
            serviceId: "w-party-mk",
            gender: "women",
            serviceName: "HD Makeup"
        }
    };

    function generateQuizResult() {
        if (quizStepPanels.length === 0) return;
        quizStepPanels.forEach(panel => panel.classList.remove('active'));

        const key = `${quizAnswers.focus}-${quizAnswers.concern}`;
        const rec = recommendations[key] || {
            title: "Hair Spa & Custom Signature Cut",
            desc: "We suggest our classic combo: a custom hair analysis and signature haircut matching your face shape, followed by an aromatic, deeply nourishing hair spa.",
            serviceId: "w-cut",
            gender: "women",
            serviceName: "Women's Haircut & Trim"
        };

        if (resultTitle) resultTitle.textContent = rec.title;
        if (resultDesc) resultDesc.textContent = rec.desc;
        if (quizResultCard) quizResultCard.style.display = 'block';

        if (bookRecommendedBtn) {
            bookRecommendedBtn.onclick = () => {
                if (!bookingModal) {
                    // Redirect back to index with booking triggers
                    window.location.href = "index.html#booking-modal";
                    return;
                }
                openBookingModal();
                setWizardGender(rec.gender);
                bookingState.selectedServices = [];
                document.querySelectorAll('.wizard-service-item').forEach(item => item.classList.remove('selected'));

                const serviceEl = document.querySelector(`.wizard-service-item[data-service-id="${rec.serviceId}"]`);
                if (serviceEl) {
                    toggleServiceSelection(serviceEl);
                } else {
                    bookingState.selectedServices.push({
                        id: rec.serviceId,
                        name: rec.serviceName
                    });
                }
                goToWizardStep(2);
            };
        }
    }

    if (restartQuizBtn) {
        restartQuizBtn.addEventListener('click', () => {
            if (quizResultCard) quizResultCard.style.display = 'none';
            quizAnswers = { focus: '', concern: '', preference: '' };
            goToQuizStep(1);
        });
    }


    // ==========================================================================
    // 7. BOOKING WIZARD MODAL STATE LOGIC
    // ==========================================================================

    function openBookingModal() {
        if (!bookingModal) return;
        bookingModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // lock scroll
        goToWizardStep(1);
    }

    function closeBookingModal() {
        if (!bookingModal) return;
        bookingModal.classList.remove('active');
        document.body.style.overflow = ''; // restore scroll
    }

    bookTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (!bookingModal) {
                // If on gallery.html, redirect back to index.html booking trigger
                return;
            }
            e.preventDefault();
            openBookingModal();
        });
    });

    if (closeBookingBtn) {
        closeBookingBtn.addEventListener('click', closeBookingModal);
    }

    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                closeBookingModal();
            }
        });
    }

    // Step Navigation
    function goToWizardStep(stepNum) {
        if (!bookingModal) return;
        bookingState.currentStep = stepNum;

        // Update Panel display
        wizardPanels.forEach(panel => panel.classList.remove('active'));
        const panel = document.querySelector(`.wizard-panel[data-panel="${stepNum}"]`);
        if (panel) panel.classList.add('active');

        // Update Steps top indicator
        wizardIndicatorSteps.forEach(ind => {
            const stepVal = parseInt(ind.getAttribute('data-wizard-step'));
            ind.classList.remove('active', 'completed');

            if (stepVal === stepNum) {
                ind.classList.add('active');
            } else if (stepVal < stepNum) {
                ind.classList.add('completed');
            }
        });

        // Update Buttons configuration
        if (stepNum === 1) {
            if (wizardBackBtn) wizardBackBtn.disabled = true;
            if (wizardNextBtn) wizardNextBtn.innerHTML = `Next <i class="fa-solid fa-arrow-right-long"></i>`;
        } else {
            if (wizardBackBtn) wizardBackBtn.disabled = false;
            if (stepNum === 3) {
                updateBookingSummaryUI();
                if (wizardNextBtn) wizardNextBtn.innerHTML = `Confirm Booking <i class="fa-solid fa-check"></i>`;
            } else {
                if (wizardNextBtn) wizardNextBtn.innerHTML = `Next <i class="fa-solid fa-arrow-right-long"></i>`;
            }
        }

        validateStepProgression();
    }

    if (wizardNextBtn) {
        wizardNextBtn.addEventListener('click', () => {
            if (bookingState.currentStep < 3) {
                goToWizardStep(bookingState.currentStep + 1);
            } else {
                submitBookingForm();
            }
        });
    }

    if (wizardBackBtn) {
        wizardBackBtn.addEventListener('click', () => {
            if (bookingState.currentStep > 1) {
                goToWizardStep(bookingState.currentStep - 1);
            }
        });
    }

    function validateStepProgression() {
        if (!bookingModal) return;
        if (bookingState.currentStep === 1) {
            if (bookingState.selectedServices.length === 0) {
                if (wizardNextBtn) wizardNextBtn.disabled = true;
            } else {
                if (wizardNextBtn) wizardNextBtn.disabled = false;
            }
        } else {
            if (wizardNextBtn) wizardNextBtn.disabled = false;
        }
    }


    // ==========================================================================
    // 8. STEP-BY-STEP FORM SELECTION LOGIC
    // ==========================================================================

    // Gender Radio toggles (Wizard Step 1)
    function setWizardGender(gender) {
        bookingState.gender = gender;

        // Update radio state in UI
        const radio = document.querySelector(`input[name="wizard-gender"][value="${gender}"]`);
        if (radio) radio.checked = true;

        // Switch visible service list
        if (gender === 'men') {
            if (wizardMenList) wizardMenList.classList.add('active');
            if (wizardWomenList) wizardWomenList.classList.remove('active');
        } else {
            if (wizardMenList) wizardMenList.classList.remove('active');
            if (wizardWomenList) wizardWomenList.classList.add('active');
        }
    }

    wizardGenderRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            bookingState.selectedServices = [];
            wizardServiceItems.forEach(item => item.classList.remove('selected'));

            setWizardGender(e.target.value);
            updateSelectedCountIndicator();
            validateStepProgression();
        });
    });

    // Service Item Clicking
    function toggleServiceSelection(element) {
        const serviceId = element.getAttribute('data-service-id');
        const name = element.getAttribute('data-name');

        element.classList.toggle('selected');

        const index = bookingState.selectedServices.findIndex(item => item.id === serviceId);
        if (index > -1) {
            // Remove
            bookingState.selectedServices.splice(index, 1);
            element.querySelector('.select-icon').className = 'fa-solid fa-circle-plus select-icon';
        } else {
            // Add
            bookingState.selectedServices.push({ id: serviceId, name });
            element.querySelector('.select-icon').className = 'fa-solid fa-circle-check select-icon';
        }

        updateSelectedCountIndicator();
        validateStepProgression();
    }

    wizardServiceItems.forEach(item => {
        item.addEventListener('click', () => {
            toggleServiceSelection(item);
        });
    });

    function updateSelectedCountIndicator() {
        if (!selectedCountText) return;
        const count = bookingState.selectedServices.length;
        if (count === 1) {
            selectedCountText.textContent = "1 Service Selected";
        } else {
            selectedCountText.textContent = `${count} Services Selected`;
        }
    }

    // Stylist Selection step was removed. Defaulting to 'Next Available Stylist'.

    // Calendar Selection (Wizard Step 3)
    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            calendarDays.forEach(d => d.classList.remove('active'));
            day.classList.add('active');

            const dateVal = day.getAttribute('data-date');
            bookingState.date = dateVal;
        });
    });

    // Time Slot Selection (Wizard Step 3)
    timeSlotBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timeSlotBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const timeVal = btn.getAttribute('data-time');
            bookingState.time = timeVal;
        });
    });


    // ==========================================================================
    // 9. SUMMARY COMPILATION & SUBMISSION
    // ==========================================================================

    function updateBookingSummaryUI() {
        if (summaryStylist) summaryStylist.textContent = bookingState.stylistName;

        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const dateObj = new Date(bookingState.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', options);
        if (summaryDatetime) summaryDatetime.textContent = `${formattedDate} at ${bookingState.time}`;

        if (summaryServicesList) {
            summaryServicesList.innerHTML = '';
            bookingState.selectedServices.forEach(service => {
                const itemRow = document.createElement('div');
                itemRow.className = 'summary-item';
                itemRow.innerHTML = `
                    <span>${service.name}</span>
                `;
                summaryServicesList.appendChild(itemRow);
            });
        }
    }

    function submitBookingForm() {
        const clientNameInput = document.getElementById('client-name');
        const clientPhoneInput = document.getElementById('client-phone');
        const clientEmailInput = document.getElementById('client-email');
        const clientNotesInput = document.getElementById('client-notes');

        if (!clientNameInput || !clientPhoneInput) return;

        const clientName = clientNameInput.value.trim();
        const clientPhone = clientPhoneInput.value.trim();
        const clientEmail = clientEmailInput ? clientEmailInput.value.trim() : '';
        const clientNotes = clientNotesInput ? clientNotesInput.value.trim() : '';

        if (!clientName) {
            clientNameInput.focus();
            showToast("Please enter your name.", "fa-triangle-exclamation");
            return;
        }

        if (!clientPhone || clientPhone.length < 10) {
            clientPhoneInput.focus();
            showToast("Please enter a valid 10-digit phone number.", "fa-triangle-exclamation");
            return;
        }

        if (wizardNextBtn) {
            wizardNextBtn.disabled = true;
            wizardNextBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;
        }

        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const dateObj = new Date(bookingState.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', options);
        const bookingDateTime = `${formattedDate} at ${bookingState.time}`;
        const servicesList = bookingState.selectedServices.map(s => s.name).join(', ');

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: 'f60b0218-7d99-4d85-814a-84c20d0aa107',
                subject: `New Salon Appointment - ${clientName}`,
                from_name: 'Hair Studio Website',
                name: clientName,
                phone: clientPhone,
                email: clientEmail || 'Not Provided',
                appointment_date_time: bookingDateTime,
                selected_services: servicesList,
                special_requests: clientNotes || 'None'
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast(`Appointment submitted successfully! Opening WhatsApp...`, 'fa-circle-check');

                    const msgText = `*Hair Studio Salon Appointment Booking*\n\n` +
                        `• *Name:* ${clientName}\n` +
                        `• *Phone:* ${clientPhone}\n` +
                        `• *Email:* ${clientEmail || 'N/A'}\n` +
                        `• *Date & Time:* ${bookingDateTime}\n` +
                        `• *Services:* ${servicesList}\n` +
                        `• *Special Requests:* ${clientNotes || 'None'}`;

                    const whatsappUrl = `https://wa.me/919991267770?text=${encodeURIComponent(msgText)}`;
                    window.open(whatsappUrl, '_blank');

                    bookingState.selectedServices = [];
                    bookingState.stylist = 'any';
                    bookingState.stylistName = 'Next Available Stylist';
                    bookingState.currentStep = 1;

                    wizardServiceItems.forEach(item => {
                        item.classList.remove('selected');
                        const icon = item.querySelector('.select-icon');
                        if (icon) icon.className = 'fa-solid fa-circle-plus select-icon';
                    });

                    if (clientNameInput) clientNameInput.value = '';
                    if (clientPhoneInput) clientPhoneInput.value = '';
                    if (clientEmailInput) clientEmailInput.value = '';
                    if (clientNotesInput) clientNotesInput.value = '';

                    updateSelectedCountIndicator();
                    closeBookingModal();
                } else {
                    showToast(data.message || "Submission failed. Please try again.", "fa-triangle-exclamation");
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                showToast("Network error. Please try again.", "fa-triangle-exclamation");
            })
            .finally(() => {
                if (wizardNextBtn) {
                    wizardNextBtn.disabled = false;
                    wizardNextBtn.innerHTML = `Next <i class="fa-solid fa-arrow-right-long"></i>`;
                }
            });
    }

    // ==========================================================================
    // 10. EXTRA FORMS HANDLERS (INQUIRY, NEWSLETTER)
    // ==========================================================================
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('inq-name').value.trim();
            const phone = document.getElementById('inq-phone').value.trim();
            const message = document.getElementById('inq-message').value.trim();

            const submitBtn = inquiryForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: 'f60b0218-7d99-4d85-814a-84c20d0aa107',
                    subject: `New Web Inquiry - ${name}`,
                    from_name: 'Hair Studio Website',
                    name: name,
                    phone: phone,
                    message: message
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast(`Inquiry sent! Opening WhatsApp...`, 'fa-circle-check');

                        const msgText = `*Hair Studio Salon Inquiry*\n\n` +
                            `• *Name:* ${name}\n` +
                            `• *Phone:* ${phone}\n` +
                            `• *Message:* ${message}`;

                        const whatsappUrl = `https://wa.me/919991267770?text=${encodeURIComponent(msgText)}`;
                        window.open(whatsappUrl, '_blank');

                        inquiryForm.reset();
                    } else {
                        showToast(data.message || "Failed to send inquiry. Please try again.", "fa-triangle-exclamation");
                    }
                })
                .catch(error => {
                    console.error('Error submitting inquiry:', error);
                    showToast("Network error. Please try again.", "fa-triangle-exclamation");
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Send Message';
                    }
                });
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input');
            const email = emailInput ? emailInput.value.trim() : '';
            const submitBtn = newsletterForm.querySelector('button');

            if (!email) return;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            }

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: 'f60b0218-7d99-4d85-814a-84c20d0aa107',
                    subject: 'New Newsletter Subscription',
                    from_name: 'Hair Studio Website',
                    email: email
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast(`Subscribed successfully with ${email}!`, 'fa-circle-check');
                        newsletterForm.reset();
                    } else {
                        showToast(data.message || "Failed to subscribe. Please try again.", "fa-triangle-exclamation");
                    }
                })
                .catch(error => {
                    console.error('Error submitting newsletter:', error);
                    showToast("Network error. Please try again.", "fa-triangle-exclamation");
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
                    }
                });
        });
    }


    // ==========================================================================
    // 11. GALLERY FILTER & LIGHTBOX SYSTEM
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let activeGalleryImages = [];
    let currentImageIndex = 0;

    if (galleryItems.length > 0) {
        // Carousel Logic
        const track = document.getElementById('gallery-carousel-track');
        const prevBtn = document.getElementById('gallery-carousel-prev');
        const nextBtn = document.getElementById('gallery-carousel-next');
        const indicatorsContainer = document.getElementById('gallery-carousel-indicators');

        let carouselIndex = 0;

        function getItemsPerPage() {
            if (window.innerWidth <= 576) return 1;
            if (window.innerWidth <= 992) return 2;
            return 3;
        }

        function updateCarousel() {
            if (!track || !prevBtn || !nextBtn || !indicatorsContainer || galleryItems.length === 0) return;
            const itemsPerPage = getItemsPerPage();
            const maxIndex = Math.max(0, galleryItems.length - itemsPerPage);

            if (carouselIndex > maxIndex) carouselIndex = maxIndex;

            // Measure slide width + gap
            const slideWidth = galleryItems[0].getBoundingClientRect().width + 24;
            track.style.transform = `translateX(-${carouselIndex * slideWidth}px)`;

            prevBtn.disabled = carouselIndex === 0;
            nextBtn.disabled = carouselIndex === maxIndex;

            updateIndicators(maxIndex);
        }

        function createIndicators(maxIndex) {
            indicatorsContainer.innerHTML = '';
            for (let i = 0; i <= maxIndex; i++) {
                const dot = document.createElement('div');
                dot.className = `indicator-dot${i === carouselIndex ? ' active' : ''}`;
                dot.addEventListener('click', () => {
                    carouselIndex = i;
                    updateCarousel();
                });
                indicatorsContainer.appendChild(dot);
            }
        }

        function updateIndicators(maxIndex) {
            if (indicatorsContainer.children.length !== maxIndex + 1) {
                createIndicators(maxIndex);
            } else {
                const dots = indicatorsContainer.querySelectorAll('.indicator-dot');
                dots.forEach((dot, i) => {
                    if (i === carouselIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                if (carouselIndex > 0) {
                    carouselIndex--;
                    updateCarousel();
                }
            });

            nextBtn.addEventListener('click', () => {
                const itemsPerPage = getItemsPerPage();
                const maxIndex = Math.max(0, galleryItems.length - itemsPerPage);
                if (carouselIndex < maxIndex) {
                    carouselIndex++;
                    updateCarousel();
                }
            });

            window.addEventListener('resize', updateCarousel);
            // Run initially with a tiny delay to ensure proper DOM element layout measurements
            setTimeout(updateCarousel, 100);
        }

        // Populate active images list for lightbox cycling
        function updateActiveGalleryList() {
            activeGalleryImages = [];
            galleryItems.forEach(item => {
                if (!item.classList.contains('hide')) {
                    const img = item.querySelector('img');
                    const title = item.querySelector('.overlay-content h4').textContent;
                    const desc = item.querySelector('.overlay-content p').textContent;
                    activeGalleryImages.push({
                        src: img.getAttribute('src'),
                        caption: `${title} - ${desc}`
                    });
                }
            });
        }

        // Initialize list
        updateActiveGalleryList();

        // Click handler for images to open lightbox
        galleryItems.forEach(item => {
            const wrapper = item.querySelector('.gallery-image-wrapper');
            wrapper.addEventListener('click', () => {
                const img = item.querySelector('img');
                const imgSrc = img.getAttribute('src');

                // Find index in active list
                currentImageIndex = activeGalleryImages.findIndex(i => i.src === imgSrc);
                openLightbox();
            });
        });

        function openLightbox() {
            const image = activeGalleryImages[currentImageIndex];
            if (!image || !lightboxModal || !lightboxImg || !lightboxCaption) return;

            lightboxImg.setAttribute('src', image.src);
            lightboxCaption.textContent = image.caption;

            lightboxModal.style.display = 'flex';
            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        }

        function closeLightbox() {
            if (!lightboxModal) return;
            lightboxModal.style.display = 'none';
            lightboxModal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scroll
        }

        function navigateLightbox(direction) {
            if (activeGalleryImages.length === 0 || !lightboxImg || !lightboxCaption) return;
            if (direction === 'next') {
                currentImageIndex = (currentImageIndex + 1) % activeGalleryImages.length;
            } else {
                currentImageIndex = (currentImageIndex - 1 + activeGalleryImages.length) % activeGalleryImages.length;
            }

            // Simple fade transition for image loading in lightbox
            lightboxImg.style.opacity = 0;
            setTimeout(() => {
                const image = activeGalleryImages[currentImageIndex];
                lightboxImg.setAttribute('src', image.src);
                lightboxCaption.textContent = image.caption;
                lightboxImg.style.opacity = 1;
            }, 150);
        }

        // Lightbox Controls
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

        if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
        if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox('next'));

        // Close lightbox on click outside the image
        if (lightboxModal) {
            lightboxModal.addEventListener('click', (e) => {
                if (e.target === lightboxModal) {
                    closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightboxModal || !lightboxModal.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                navigateLightbox('next');
            } else if (e.key === 'ArrowLeft') {
                navigateLightbox('prev');
            }
        });
    }

    // 13. SPECIAL OFFER POPUP SYSTEM WITH 2-IMAGE CAROUSEL
    const offerPopup = document.getElementById('offer-popup-modal');
    const offerClose = document.getElementById('offer-popup-close');
    const offerBackdrop = document.getElementById('offer-popup-backdrop');
    const claimOfferBtn = document.getElementById('claim-offer-btn');

    const offerTrack = document.getElementById('offer-slider-track');
    const offerPrev = document.getElementById('offer-slider-prev');
    const offerNext = document.getElementById('offer-slider-next');
    const offerDots = document.querySelectorAll('.offer-dot');

    let currentOfferSlide = 0;
    let offerAutoSlideInterval = null;

    if (offerPopup) {
        // Slider Navigation Functions
        function goToOfferSlide(index) {
            currentOfferSlide = index;
            if (offerTrack) {
                offerTrack.style.transform = `translateX(-${currentOfferSlide * 100}%)`;
            }
            offerDots.forEach((dot, i) => {
                if (i === currentOfferSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function startAutoSlide() {
            stopAutoSlide();
            offerAutoSlideInterval = setInterval(() => {
                const nextIndex = (currentOfferSlide + 1) % 2;
                goToOfferSlide(nextIndex);
            }, 3500);
        }

        function stopAutoSlide() {
            if (offerAutoSlideInterval) {
                clearInterval(offerAutoSlideInterval);
                offerAutoSlideInterval = null;
            }
        }

        if (offerPrev) {
            offerPrev.addEventListener('click', () => {
                const prevIndex = (currentOfferSlide - 1 + 2) % 2;
                goToOfferSlide(prevIndex);
                startAutoSlide();
            });
        }

        if (offerNext) {
            offerNext.addEventListener('click', () => {
                const nextIndex = (currentOfferSlide + 1) % 2;
                goToOfferSlide(nextIndex);
                startAutoSlide();
            });
        }

        offerDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goToOfferSlide(i);
                startAutoSlide();
            });
        });

        // Only show once per browser session
        if (!sessionStorage.getItem('offerPopupShown')) {
            setTimeout(() => {
                offerPopup.classList.add('active');
                sessionStorage.setItem('offerPopupShown', 'true');
                startAutoSlide();
            }, 2000); // Premium 2s delay reveal
        }

        const closePopup = () => {
            offerPopup.classList.remove('active');
            stopAutoSlide();
        };

        if (offerClose) offerClose.addEventListener('click', closePopup);
        if (offerBackdrop) offerBackdrop.addEventListener('click', closePopup);

        if (claimOfferBtn) {
            claimOfferBtn.addEventListener('click', () => {
                closePopup();
                if (typeof openBookingModal === 'function') {
                    openBookingModal();
                }
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && offerPopup.classList.contains('active')) {
                closePopup();
            }
        });
    }

    // 12. CHATBOT ASSISTANT SYSTEM
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const quickReplies = document.getElementById('chat-quick-replies');

    if (chatbotToggle && chatbotWindow) {
        // Toggle Chat window
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('active');
            // Remove pulse indicator once opened
            const pulse = chatbotToggle.querySelector('.chatbot-pulse');
            if (pulse) pulse.remove();

            if (chatbotWindow.classList.contains('active')) {
                chatbotInput.focus();
                scrollToBottom();
            }
        });

        // Close Chat window
        if (chatbotCloseBtn) {
            chatbotCloseBtn.addEventListener('click', () => {
                chatbotWindow.classList.remove('active');
            });
        }

        // Send message on click
        if (chatbotSend) {
            chatbotSend.addEventListener('click', handleUserMessage);
        }

        // Send message on Enter key
        if (chatbotInput) {
            chatbotInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleUserMessage();
                }
            });
        }

        // Handle Quick Replies
        if (quickReplies) {
            quickReplies.addEventListener('click', (e) => {
                const btn = e.target.closest('.quick-reply-btn');
                if (!btn) return;

                const text = btn.getAttribute('data-reply');
                sendUserMessage(text);

                // Hide quick replies after selection
                quickReplies.style.display = 'none';

                // Bot response
                setTimeout(() => {
                    respondToUser(text);
                }, 800);
            });
        }

        function handleUserMessage() {
            const text = chatbotInput.value.trim();
            if (!text) return;

            sendUserMessage(text);
            chatbotInput.value = '';

            // Hide quick replies once typing/sending starts
            if (quickReplies) quickReplies.style.display = 'none';

            // Bot response
            setTimeout(() => {
                respondToUser(text);
            }, 800);
        }

        function sendUserMessage(text) {
            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message user';
            msgDiv.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
            chatbotMessages.appendChild(msgDiv);
            scrollToBottom();
        }

        function respondToUser(text) {
            const reply = getBotResponse(text);

            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message bot';
            msgDiv.innerHTML = `<div class="chat-bubble">${formatMessageText(reply)}</div>`;
            chatbotMessages.appendChild(msgDiv);
            scrollToBottom();
        }

        function scrollToBottom() {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }

        function escapeHtml(string) {
            return String(string).replace(/[&<>"']/g, function (s) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[s];
            });
        }

        function formatMessageText(text) {
            // Replace **bold** with <strong>bold</strong>
            let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Replace [label](url) with a styled link
            formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--primary-gold); text-decoration: underline; font-weight: 500;">$1</a>');
            return formatted;
        }

        function getBotResponse(input) {
            const query = input.toLowerCase();

            if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('hola')) {
                return "Hello! Hope you are having a wonderful day. How can I assist you with your styling or grooming needs today?";
            }
            if (query.includes('hour') || query.includes('timing') || query.includes('open') || query.includes('close') || query.includes('time')) {
                return "We are open 7 days a week, from **09:00 AM to 08:00 PM** (including public holidays)!";
            }
            if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('map') || query.includes('place') || query.includes('rewari')) {
                return "We are located at **Shop No 94-L, Model Town, Rewari, Haryana (near The Dot Coaching Centre)**. You can view our map on the home page or click [Open Google Maps](https://maps.google.com/?q=Hair+Studio+Salon+Model+Town+Rewari)!";
            }
            if (query.includes('book') || query.includes('appointment') || query.includes('reserve') || query.includes('schedule') || query.includes('wizard')) {
                return "You can easily schedule your visit using our 3-step booking wizard! Click any **'Book Appointment'** button on our site to open it.";
            }
            if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('charge') || query.includes('how much') || query.includes('rate')) {
                return "To offer fully tailored consultations, we've removed pricing from the website. All bills are settled in-person after service completion, but feel free to call us at **099912 67770** or ask during your visit for exact details!";
            }
            if (query.includes('service') || query.includes('haircut') || query.includes('color') || query.includes('facial') || query.includes('beard') || query.includes('spa') || query.includes('grooming') || query.includes('shave') || query.includes('styling') || query.includes('bridal') || query.includes('makeup')) {
                return "We offer premium haircuts, precision beard styling, creative hair coloring/balayage, skin facials, and bridal packages. You can explore the **Services** section on our home page or click [Explore Services](index.html#services) for details!";
            }
            if (query.includes('quiz') || query.includes('finder') || query.includes('style') || query.includes('face') || query.includes('recommend')) {
                return "Try our interactive **Style Finder Quiz** to discover the perfect hairstyle based on your face shape! Just scroll to the Style Finder section on the home page or click [Style Finder](index.html#quiz).";
            }
            if (query.includes('instagram') || query.includes('social') || query.includes('photo') || query.includes('pic') || query.includes('insta')) {
                return "Follow us on Instagram **[@hairstudiosalon6](https://www.instagram.com/hairstudiosalon6?igsh=MWM5MmZndDB5OTRxaA%3D%3D&utm_source=qr)** to check out our latest style transformations!";
            }
            if (query.includes('phone') || query.includes('contact') || query.includes('call') || query.includes('number') || query.includes('whatsapp') || query.includes('mobile')) {
                return "You can call us directly at **099912 67770** or chat with us on WhatsApp at [+91 9991267770](https://wa.me/919991267770)!";
            }
            if (query.includes('thank') || query.includes('thanks') || query.includes('awesome') || query.includes('great')) {
                return "You're very welcome! If there's anything else you need, just ask. Have a fabulous day!";
            }

            // Default response
            return "I'd love to help you with that! Feel free to call us at **099912 67770**, chat with us on [WhatsApp](https://wa.me/919991267770), or use our online wizard to book an appointment!";
        }
    }

    const track = document.getElementById("gallery-carousel-track");

    // Create Images
    for (let i = 1; i <= 30; i++) {
        track.innerHTML += `
        <div class="gallery-item">
            <div class="gallery-image-wrapper">
                <img src="assets/1 (${i}).webp" alt="Image ${i}" loading="lazy">
            </div>
        </div>
    `;
    }

    const items = document.querySelectorAll(".gallery-item");
    const prevBtn = document.getElementById("gallery-carousel-prev");
    const nextBtn = document.getElementById("gallery-carousel-next");

    let currentIndex = 0;

    function updateCarousel() {
        const itemWidth = items[0].offsetWidth + 20; // 20 = gap between items
        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }

    nextBtn.addEventListener("click", () => {
        if (currentIndex < items.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    window.addEventListener("resize", updateCarousel);

});

let currentOfferSlide = 0;
const slides = document.getElementById("offerSlides");
const totalOfferSlides = slides.children.length;

function moveOfferSlide(direction) {
    currentOfferSlide += direction;

    if (currentOfferSlide >= totalOfferSlides) {
        currentOfferSlide = 0;
    }

    if (currentOfferSlide < 0) {
        currentOfferSlide = totalOfferSlides - 1;
    }

    slides.style.transform = `translateX(-${currentOfferSlide * 100}%)`;
}

// Auto Slide every 3 seconds
setInterval(() => {
    moveOfferSlide(1);
}, 3000);

document.addEventListener("DOMContentLoaded", function () {

    const slides = document.getElementById("offerSlides");
    const totalSlides = slides.children.length;
    let currentSlide = 0;

    function autoSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Slide every 2 seconds
    setInterval(autoSlide, 2000);

});
