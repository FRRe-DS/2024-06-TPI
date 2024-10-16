<script>
        // Initialization for ES Users
        import {
            Carousel,
            initTWE,
        } from "tw-elements";
    
        initTWE({ Carousel })
    </script>
    
    <div
            id="carouselExampleCaptions"
            class="relative"
            data-twe-carousel-init
            data-twe-ride="carousel">
        
        <!-- Carousel items -->
        <div
                class="relative w-full overflow-hidden after:clear-both after:block after:content-['']">
            
            <!-- First item -->
            <div
                    class="relative float-left -mr-[100%] w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none"
                    data-twe-carousel-active
                    data-twe-carousel-item
                    style="backface-visibility: hidden">
                <div class="relative">
                    <img
                            src="https://scontent.fres5-1.fna.fbcdn.net/v/t39.30808-6/344305656_1992755644407106_5511434024944661396_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeF2XcvqAVr0_AZJzXCoY_jcq4zhyh8E2a-rjOHKHwTZr8QA_-xnVaylrF6vq44io9yGWdR7jHldjUR3cXEBeQZG&_nc_ohc=gM2Y8z_VBiEQ7kNvgFJ_FTT&_nc_zt=23&_nc_ht=scontent.fres5-1.fna&_nc_gid=AGIhEoyBMKeQtAmTIYwcDVT&oh=00_AYC8Gi-xAm7hBvO94VYqZ_gE7ADXQ_c_ZnMMf7FvU5-aYw&oe=671521F1"
                            class="block w-full"
                            alt="..." />
                    <!-- Fade effect -->
                    <div class="fade-top"></div>
                    <div class="fade-bottom"></div>
                </div>
                <div
                        class="absolute inset-x-[15%] bottom-5 hidden py-5 text-center text-white md:block">
                    <h5 class="text-xl">...</h5>
                </div>
            </div>
            
            <!-- Additional items would follow here... -->
            
        </div>
    
        <!-- Carousel controls -->
        <button
                class="absolute bottom-0 left-0 top-0 z-[1] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
                type="button"
                data-twe-target="#carouselExampleCaptions"
                data-twe-slide="prev">
            <span class="inline-block h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </span>
            <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Previous</span>
        </button>
        <button
                class="absolute bottom-0 right-0 top-0 z-[1] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
                type="button"
                data-twe-target="#carouselExampleCaptions"
                data-twe-slide="next">
            <span class="inline-block h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </span>
            <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Next</span>
        </button>
    </div>
    
    <style>
        /* Fade effect styles */
        .fade-top, .fade-bottom {
            position: absolute;
            left: 0;
            right: 0;
            height: 7%; /* Adjust height for the fade area */
            pointer-events: none; /* Ensure the fade doesn't block interactions */
        }
    
        .fade-top {
            top: 0;
            background: linear-gradient(to bottom, rgba(109, 46, 1, 0.75), rgba(109, 46, 1, 0)); /* Adjust color as needed */
        }
    
        .fade-bottom {
            bottom: 0;
            background: linear-gradient(to top, rgba(109, 46, 1, 0.75), rgba(109, 46, 1, 0)); /* Adjust color as needed */
        }
    </style>
    