"use client";

// Homepage component
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/ui/SearchBar";
import SocialProofCarousel from "@/components/ui/SocialProofCarousel";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface InstructorData {
  id: string;
  name: string;
  avatar_url: string | null;
  hourly_rate: number;
  location: string;
  vehicle_type: string;
  description: string;
  rating: number;
}

export default function Home() {
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Removed homepage auth redirect detection
  // Supabase should redirect directly to /welcome via redirect_to parameter

  useEffect(() => {
    const fetchTopInstructors = async () => {
      try {
        const sb = createSupabaseBrowser();
        const { data, error } = await sb
          .from("instructors")
          .select(`
            id, 
            description, 
            base_postcode, 
            vehicle_type, 
            hourly_rate, 
            gender, 
            lat, 
            lng, 
            profiles!inner(name, avatar_url)
          `)
          .eq("verification_status", "approved")
          .not("lat", "is", null)
          .not("lng", "is", null)
          .limit(8);

        if (error) {
          console.error("Supabase query error:", error);
          // If Supabase is not configured, show mock data
          if (error.message.includes("Missing") || error.message.includes("environment")) {
            const mockInstructors = [
              {
                id: "mock-1",
                name: "Sarah",
                avatar_url: null,
                hourly_rate: 35,
                location: "Bristol",
                vehicle_type: "manual",
                description: "Experienced instructor with 10+ years",
                rating: 4.8
              },
              {
                id: "mock-2", 
                name: "James",
                avatar_url: null,
                hourly_rate: 30,
                location: "Bath",
                vehicle_type: "both",
                description: "Patient and friendly instructor",
                rating: 4.9
              },
              {
                id: "mock-3",
                name: "Emma",
                avatar_url: null,
                hourly_rate: 32,
                location: "Bristol",
                vehicle_type: "auto",
                description: "Specializes in nervous learners",
                rating: 4.7
              }
            ];
            setInstructors(mockInstructors);
            return;
          }
          throw error;
        }
        

        const instructorData = (data as Record<string, unknown>[])?.map((r: Record<string, unknown>) => {
          const location = r.base_postcode && typeof r.base_postcode === 'string' ? getTownFromPostcode(r.base_postcode) : "Unknown";
          // Fix: profiles is a single object with !inner join, not an array
          const profile = r.profiles as { name: string | null; avatar_url: string | null };
          const fullName = profile?.name || "Instructor";
          const firstName = fullName.split(' ')[0]; // Get only the first name
          const avatarUrl = profile?.avatar_url || null;
          
          console.log('Instructor:', firstName, 'Postcode:', r.base_postcode, 'Location:', location, 'Profile:', profile);
          
          return {
            id: typeof r.id === 'string' ? r.id : String(r.id || ''),
            name: firstName,
            avatar_url: avatarUrl,
            hourly_rate: typeof r.hourly_rate === 'number' ? r.hourly_rate : 30,
            location: location,
            vehicle_type: typeof r.vehicle_type === 'string' ? r.vehicle_type : "manual",
            description: typeof r.description === 'string' ? r.description : "",
            rating: 4.8 // Placeholder rating
          };
        }) ?? [];

        setInstructors(instructorData);
      } catch (e) {
        console.error("Failed to fetch instructors:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTopInstructors();
  }, []); // Empty dependency array - only run once

  function getTownFromPostcode(postcode: string): string {
    // Map common Bristol area postcodes to town names
    const postcodeToTown: { [key: string]: string } = {
      'BS1': 'Bristol City Centre',
      'BS2': 'Bristol',
      'BS3': 'Bristol',
      'BS4': 'Bristol',
      'BS5': 'Bristol',
      'BS6': 'Bristol',
      'BS7': 'Bristol',
      'BS8': 'Bristol',
      'BS9': 'Bristol',
      'BS10': 'Bristol',
      'BS11': 'Bristol',
      'BS13': 'Bristol',
      'BS14': 'Bristol',
      'BS15': 'Bristol',
      'BS16': 'Bristol',
      'BS20': 'Bristol',
      'BS21': 'Clevedon',
      'BS22': 'Weston-super-Mare',
      'BS23': 'Weston-super-Mare',
      'BS24': 'Weston-super-Mare',
      'BS25': 'Winscombe',
      'BS26': 'Axbridge',
      'BS27': 'Cheddar',
      'BS28': 'Wells',
      'BS29': 'Burnham-on-Sea',
      'BS30': 'Bath',
      'BS31': 'Bath',
      'BS32': 'Bristol',
      'BS34': 'Bristol',
      'BS35': 'Thornbury',
      'BS36': 'Bristol',
      'BS37': 'Yate',
      'BS39': 'Radstock',
      'BS40': 'Bristol',
      'BS41': 'Bristol',
      'BS48': 'Portishead',
      'BS49': 'Nailsea',
      'BA1': 'Bath',
      'BA2': 'Bath',
      'BA3': 'Radstock',
      'BA4': 'Shepton Mallet',
      'BA5': 'Wells',
      'BA6': 'Glastonbury',
      'BA7': 'Yeovil',
      'BA8': 'Templecombe',
      'BA9': 'Wincanton',
      'BA10': 'Bruton',
      'BA11': 'Frome',
      'BA12': 'Warminster',
      'BA13': 'Westbury',
      'BA14': 'Trowbridge',
      'BA15': 'Bradford-on-Avon',
      'BA16': 'Street'
    };

    if (!postcode) return 'Bristol';
    
    // Extract the first part of the postcode (e.g., BS1 from BS1 3BD)
    const postcodePrefix = postcode.split(' ')[0];
    const town = postcodeToTown[postcodePrefix] || 'Bristol';
    
    
    return town;
  }

  const handleSearch = (query: string) => {
    // Redirect to search page with query
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

    const journeySteps = [
      {
        step: "1",
        title: "Find",
        description: "Find your\nperfect match",
        icon: "https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Find.png",
        color: "from-blue-400 to-purple-500"
      },
      {
        step: "2", 
        title: "Learn",
        description: "Learn with\ncertified pros",
        icon: "https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Learn.png",
        color: "from-orange-400 to-red-500"
      },
      {
        step: "3",
        title: "Pass",
        description: "Pass your\ndriving test!",
        icon: "https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Pass.png",
        color: "from-green-400 to-emerald-500"
      }
    ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Mobile First */}
      <section className="px-6 pt-[22px] pb-[7px] md:pt-[27px] md:pb-[7px]">
        <div className="max-w-md mx-auto text-center">
                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-gray-900 leading-tight mb-[11px] md:whitespace-nowrap">
                   The <span className="text-green-500 font-bold">BEST</span> instructors!
                 </h1>
          
          <p className="text-lg text-gray-600 mb-[19px] leading-relaxed">
            Your instructor in seconds
          </p>
          
          {/* Search Bar */}
                <div className="mb-[9px]">
                  <SearchBar 
                    placeholder="e.g. BS1 3BD or BS13BD"
                    onSearch={handleSearch}
                  />
                </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-5 gap-2 mb-[19px] pb-1 max-w-2xl mx-auto">
            {/* Card */}
            <div className="relative bg-gray-50 rounded-xl shadow-md h-10 overflow-hidden">
              <Image 
                src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/credit-card.png"
                alt="Credit Card"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
            </div>

            {/* PayPal */}
            <div className="relative bg-gray-50 rounded-xl shadow-md h-10 overflow-visible flex items-center justify-center">
              <div className="relative w-full h-full scale-[1.6]">
                <Image 
                  src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/PayPal.png"
                  alt="PayPal"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </div>
            </div>

            {/* Klarna */}
            <div className="relative bg-[#FFB3C7] rounded-xl shadow-sm h-10 overflow-visible flex items-center justify-center">
              <div className="relative w-full h-full scale-[0.85]">
                <Image 
                  src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Klarna.png"
                  alt="Klarna"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </div>
            </div>

            {/* Apple Pay */}
            <div className="relative bg-gray-50 rounded-xl shadow-md h-10 overflow-visible flex items-center justify-center">
              <div className="relative w-full h-full scale-[0.7]">
                <Image 
                  src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/ApplePay.png"
                  alt="Apple Pay"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </div>
            </div>

            {/* Google Pay */}
            <div className="relative bg-gray-50 rounded-xl shadow-md h-10 overflow-visible flex items-center justify-center">
              <div className="relative w-full h-full scale-[0.7]">
                <Image 
                  src="https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/Google%20Pay.png"
                  alt="Google Pay"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Instructors Carousel */}
      <section className="px-6 pt-[10px] pb-2 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-[9px] text-center">
            Top Instructors Near You
          </h2>
          
          {loading ? (
            <div className="flex space-x-4 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[295px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden">
              <div className="flex space-x-4 animate-scroll" style={{ width: 'max-content' }}>
                {instructors.map((instructor) => (
                  <Link key={instructor.id} href={`/instructor/${instructor.id}`} className="flex-shrink-0 w-[295px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer relative">
                    <div className="flex items-start space-x-4">
                      {/* Content - Left side */}
                      <div className="w-48 min-w-0 flex flex-col items-start text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate w-full">
                          {instructor.name}
                        </h3>
                        <p className="text-sm text-black mb-2">
                          📍 {instructor.location.length > 12 ? instructor.location.substring(0, 12) + '...' : instructor.location}
                        </p>
                        <div className="flex items-center mb-2">
                          <span className="px-3 py-1 bg-gray-100 text-black rounded-full text-sm">
                            {instructor.vehicle_type === 'both' ? 'Auto & Manual' : instructor.vehicle_type === 'auto' ? 'Auto' : instructor.vehicle_type === 'manual' ? 'Manual' : instructor.vehicle_type}
                          </span>
                        </div>
                        {/* Price badge */}
                        <div className="flex justify-start">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            £{instructor.hourly_rate}/hr
                          </span>
                        </div>
                      </div>
                      
                      {/* Profile Photo and Rating Column - Right side */}
                      <div className="flex flex-col items-center space-y-3">
                        {/* Profile Photo */}
                        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                          {instructor.avatar_url ? (
                            <Image 
                              src={instructor.avatar_url} 
                              alt={instructor.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-green-500 flex items-center justify-center text-white font-bold text-3xl">
                              {instructor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        
                        {/* Rating under image */}
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-sm">⭐</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {/* Duplicate for seamless loop */}
                {instructors.map((instructor) => (
                  <Link key={`${instructor.id}-duplicate`} href={`/instructor/${instructor.id}`} className="flex-shrink-0 w-[295px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer relative">
                    <div className="flex items-start space-x-4">
                      {/* Content - Left side */}
                      <div className="w-48 min-w-0 flex flex-col items-start text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate w-full">
                          {instructor.name}
                        </h3>
                        <p className="text-sm text-black mb-2">
                          📍 {instructor.location.length > 12 ? instructor.location.substring(0, 12) + '...' : instructor.location}
                        </p>
                        <div className="flex items-center mb-2">
                          <span className="px-3 py-1 bg-gray-100 text-black rounded-full text-sm">
                            {instructor.vehicle_type === 'both' ? 'Auto & Manual' : instructor.vehicle_type === 'auto' ? 'Auto' : instructor.vehicle_type === 'manual' ? 'Manual' : instructor.vehicle_type}
                          </span>
                        </div>
                        {/* Price badge */}
                        <div className="flex justify-start">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            £{instructor.hourly_rate}/hr
                          </span>
                        </div>
                      </div>
                      
                      {/* Profile Photo and Rating Column - Right side */}
                      <div className="flex flex-col items-center space-y-3">
                        {/* Profile Photo */}
                        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                          {instructor.avatar_url ? (
                            <Image 
                              src={instructor.avatar_url} 
                              alt={instructor.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-green-500 flex items-center justify-center text-white font-bold text-3xl">
                              {instructor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                        
                        {/* Rating under image */}
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-sm">⭐</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-center mt-3 pb-[3px]">
            <Link href="/search" className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-[13px] rounded-2xl transition-colors w-[70%]">
              View Instructors
            </Link>
             </div>
           </div>
         </section>

         {/* Social Proof Section */}
         <section className="px-6 py-[10px] bg-white">
           <div className="max-w-6xl mx-auto">
            <p className="text-gray-600 mb-[17px] text-center">
              Join our qualified driver alumni!
            </p>
            <SocialProofCarousel />
          </div>
        </section>

      {/* Journey Steps */}
      <section className="px-6 pt-3 pb-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-2">
            <h2 className="text-xl font-normal text-gray-900 mb-[15px]">Your learner journey made simple.</h2>
            <div className="grid grid-cols-3 gap-8">
              {journeySteps.map((step) => {
                const gradientClass = step.step === "1" 
                  ? "bg-gradient-to-br from-blue-100 to-purple-100"
                  : step.step === "2"
                  ? "bg-gradient-to-br from-orange-100 to-pink-100"
                  : "bg-gradient-to-br from-green-100 to-emerald-100";
                
                return (
                <div key={step.step} className="text-center relative">
                  <div className={`w-[92px] h-[92px] ${gradientClass} rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.21] hover:rotate-6 relative overflow-hidden group`}>
                    <div className="relative w-full h-full z-10 rounded-full flex items-center justify-center">
                      <div className="relative w-full h-full scale-[1.15]">
                        <Image 
                          src={step.icon}
                          alt={step.title}
                          fill
                          className="object-contain rounded-full drop-shadow-md"
                          sizes="(max-width: 768px) 92px, 92px"
                          quality={100}
                          unoptimized={false}
                        />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

         {/* FAQs Section */}
         <section className="px-6 py-2" aria-labelledby="faqs-heading">
           <div className="max-w-2xl mx-auto">
             <h2 id="faqs-heading" className="text-xl font-semibold text-gray-900 mb-6 text-center">
               Frequently asked questions
             </h2>
             <div className="space-y-3">
               {[
                 {
                   id: 1,
                   question: "Do I need to pass the theory first?",
                   answer: "No, you can start lessons as soon as you have your provisional licence. You only need to pass the theory test before booking your practical driving test."
                 },
                 {
                   id: 2,
                   question: "How many lessons will I need?",
                   answer: "The DVSA suggest that the average learner takes around 44 hours of instruction, some with private practice to have the best chance of passing and being safe on the road. Many people start with an instructor, log hours in a parent's car, and polish up before their test. If you take this approach make sure you are included on their insurance first!"
                 },
                 {
                   id: 3,
                   question: "What happens if I need to cancel or reschedule a lesson?",
                   answer: "You can cancel or reschedule any lesson, but instructors need 72 hours' notice. Cancelling inside 72 hours may result in being charged the full lesson fee as your instructor is unlikely to find a replacement at short notice."
                 },
                 {
                   id: 4,
                   question: "What's the best way to prepare for the theory and practical driving tests?",
                   answer: "Use official DVSA materials for the theory and practise hazard perception regularly. For the practical, your instructor will guide you through manoeuvres, driving confidence, and test-ready skills."
                 }
               ].map((faq, index) => {
                 const isOpen = openFaq === faq.id;
                 return (
                   <div key={faq.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <button
                       type="button"
                       id={`faq-question-${faq.id}`}
                       className={`w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset focus:rounded-2xl transition-all duration-200 ${
                         isOpen 
                           ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100' 
                           : 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100'
                       }`}
                       aria-expanded={isOpen}
                       aria-controls={`faq-answer-${faq.id}`}
                       onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                           e.preventDefault();
                           setOpenFaq(isOpen ? null : faq.id);
                         } else if (e.key === 'ArrowDown') {
                           e.preventDefault();
                           const nextButton = document.querySelector(`[data-faq-index="${index + 1}"]`) as HTMLButtonElement;
                           nextButton?.focus();
                         } else if (e.key === 'ArrowUp') {
                           e.preventDefault();
                           const prevButton = document.querySelector(`[data-faq-index="${index - 1}"]`) as HTMLButtonElement;
                           prevButton?.focus();
                         }
                       }}
                       data-faq-index={index}
                     >
                       <span className="text-sm font-normal text-gray-900 pr-4">
                         {faq.question}
                       </span>
                       <svg
                         className={`w-5 h-5 text-gray-600 flex-shrink-0 ${
                           prefersReducedMotion ? '' : 'transition-transform duration-300'
                         } ${isOpen ? 'rotate-180' : ''}`}
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                         aria-hidden="true"
                       >
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </button>
                     <div
                       id={`faq-answer-${faq.id}`}
                       role="region"
                       aria-labelledby={`faq-question-${faq.id}`}
                       className={`overflow-hidden ${
                         isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                       }`}
                       style={{
                         transition: prefersReducedMotion
                           ? 'none'
                           : 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out'
                       }}
                     >
                       <div className="px-6 pb-4">
                         <p className="text-sm text-gray-600 leading-relaxed">
                           {faq.answer}
                         </p>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         </section>

      {/* CTA Section */}
      <section className="px-6 py-[18px] bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-[29px]">
            Ready to start your journey?
          </h2>
          <div className="space-y-4">
            <Link href="/search" className="block bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-[11px] rounded-2xl transition-colors w-[70%] mx-auto">
              Find Your Instructor
            </Link>
            <Link href="/sign-in" className="block bg-white border-2 border-gray-200 hover:border-green-500 text-gray-700 font-semibold px-8 py-[11px] rounded-2xl transition-colors w-[70%] mx-auto">
              Sign Up as Instructor
            </Link>
          </div>
        </div>
      </section>

      {/* Social Media Links */}
      <section className="px-6 pt-[9px] pb-3 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 text-base mb-[21px]">
            Follow our socials!
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-md mx-auto items-center">
            <a 
              href="https://instagram.com/lplateapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="font-medium">Insta</span>
            </a>
            
            <a 
              href="https://www.tiktok.com/@lplateapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 bg-black text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="font-medium">TikTok</span>
            </a>
            
            <a 
              href="https://www.facebook.com/LPlateApp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-medium">Facebook</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pt-2 pb-4 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Terms of Service
              </a>
              <span className="text-gray-300">|</span>
              <a href="mailto:Staff@LPlateApp.com" className="hover:text-gray-900 transition-colors">
                Help & Support
              </a>
            </div>
            <p>© L Plate Ltd</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
