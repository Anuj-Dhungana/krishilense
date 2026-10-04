// ==============================================================================
// CENTRALIZED TRANSLATION DICTIONARY — KrishiLens Nepal
// Every UI string across all pages lives here. No hardcoded text in components.
// ==============================================================================

export type Language = "ne" | "en";

export const translations = {
  // ============================================================================
  // GLOBAL / SHARED
  // ============================================================================
  brand_name: { ne: "KrishiLens Nepal", en: "KrishiLens Nepal" },
  brand_tagline: {
    ne: "कृषि बजार मूल्य सूचना तथा निर्णय प्रणाली",
    en: "Agriculture Market Intelligence & Decision Support",
  },
  currency: { ne: "रु.", en: "Rs." },
  unit_kg: { ne: "किलोग्राम", en: "kg" },
  unit_per: { ne: "प्रति", en: "per" },
  loading: { ne: "लोड हुँदैछ...", en: "Loading..." },
  not_available: { ne: "—", en: "—" },
  back_to_home: { ne: "← गृहपृष्ठमा फर्कनुहोस्", en: "← Back to Home" },
  all: { ne: "सबै", en: "All" },

  // ============================================================================
  // NAVBAR
  // ============================================================================
  nav_daily_market: { ne: "दैनिक बजार", en: "Daily Market" },
  nav_what_to_grow: { ne: "🌱 के रोप्ने?", en: "🌱 What to Grow?" },
  nav_comparison: { ne: "📊 बजार तुलना", en: "📊 Market Comparison" },
  nav_methodology: { ne: "📖 विधि तथा स्रोत", en: "📖 Methodology & Sources" },

  // ============================================================================
  // FOOTER
  // ============================================================================
  footer_source: {
    ne: "स्रोत: कृषि बजार मूल्य सूचना प्रणाली (AMPIS), कालिमाटी बोर्ड र कृषि सूचना तथा प्रशिक्षण केन्द्र (AITC)",
    en: "Source: Agriculture Market Price Information System (AMPIS), Kalimati Board & Agriculture Information and Training Centre (AITC)",
  },
  footer_version: {
    ne: "कार्यविधि संस्करण: v1.1-phase3.4-A1 • KrishiLens Nepal Research",
    en: "Methodology Version: v1.1-phase3.4-A1 • KrishiLens Nepal Research",
  },

  // ============================================================================
  // HOMEPAGE
  // ============================================================================
  home_badge: { ne: "दैनिक थोक बजार बुलेटिन", en: "Daily Wholesale Market Bulletin" },
  home_hero_title: {
    ne: "कृषि बजार बुझौं, सही समयमा सही बाली चुनौं",
    en: "Understand the Agricultural Market, Choose the Right Crop at the Right Time",
  },
  home_hero_desc: {
    ne: "नेपालका १२ वटै प्रमुख संघीय कृषि थोक बजारहरूको दैनिक मूल्य, ऐतिहासिक मौसमी चक्र र बाली योजना निर्णय प्रणाली।",
    en: "Daily prices, historical seasonal cycles, and crop planning decision system from all 12 major federal agricultural wholesale markets in Nepal.",
  },
  home_cta_plan: {
    ne: "🎯 आफ्नो जग्गा अनुसार बाली सिफारिस हेर्नुहोस् ➔",
    en: "🎯 Get Crop Recommendations for Your Land ➔",
  },
  home_market_label: { ne: "बजार छनोट:", en: "Select Market:" },
  home_listed_commodities: { ne: "सूचीकृत कृषि उपज:", en: "Listed Commodities:" },
  home_data_date_prefix: { ne: "तथ्याङ्क मिति:", en: "Data Date:" },
  home_data_date_bs_suffix: { ne: "वि.सं.", en: "BS" },
  home_methodology_label: { ne: "गणना विधि: थोक दर", en: "Method: Wholesale Rate" },
  home_today: { ne: "आज", en: "Today" },

  // Table Headers
  th_commodity: { ne: "कृषि उपज", en: "Commodity" },
  th_category: { ne: "वर्ग", en: "Category" },
  th_unit: { ne: "इकाइ", en: "Unit" },
  th_min_price: { ne: "न्यूनतम", en: "Minimum" },
  th_max_price: { ne: "अधिकतम", en: "Maximum" },
  th_avg_price: { ne: "औसत मूल्य", en: "Avg. Price" },

  home_empty_category: {
    ne: "यस वर्ग मा यस बजारको लागि आजको मूल्य विवरण उपलब्ध छैन।",
    en: "No price data available for this category in this market today.",
  },

  // Category names
  cat_all: { ne: "सबै", en: "All" },
  cat_vegetables: { ne: "तरकारी", en: "Vegetables" },
  cat_grains: { ne: "खाद्यान्न बाली", en: "Grains & Cereals" },
  cat_dairy: { ne: "दुग्धजन्य", en: "Dairy" },
  cat_meat: { ne: "मासु", en: "Meat" },
  cat_fruits: { ne: "फलफूल", en: "Fruits" },
  cat_spices: { ne: "मसला बाली", en: "Spices" },
  cat_leafy: { ne: "सागपात", en: "Leafy Vegetables" },
  cat_mushroom: { ne: "च्याउ खेती", en: "Mushrooms" },
  cat_tuber: { ne: "कन्दमुल बाली", en: "Tubers & Root Crops" },
  cat_legumes: { ne: "कोसे / दाल बाली", en: "Legumes & Pulses" },
  cat_fish: { ne: "माछा", en: "Fish" },

  // ============================================================================
  // PLAN PAGE (What to Grow)
  // ============================================================================
  plan_title: { ne: "यस पटक कुन बाली लगाउने?", en: "What Should I Grow This Season?" },
  plan_desc: {
    ne: "तपाईंको ठेगाना, सिँचाइको अवस्था र रोप्ने महिना अनुसार AITC आधिकारिक क्यालेन्डर र १० वर्षे बजार प्रवृत्तिको आधारमा बाली सिफारिस।",
    en: "Crop recommendations based on your address, irrigation status, and planting month using the official AITC calendar and 10-year market trends.",
  },
  plan_label_district: { ne: "१. जिल्ला छान्नुहोस्", en: "1. Select District" },
  plan_label_irrigation: { ne: "२. सिँचाइको सुविधा", en: "2. Irrigation Facility" },
  plan_label_month: { ne: "३. बाली रोप्ने महिना", en: "3. Planting Month" },
  plan_irrigated: { ne: "पर्याप्त सिँचाइ", en: "Fully Irrigated" },
  plan_semi_irrigated: { ne: "आंशिक सिँचाइ", en: "Semi-Irrigated" },
  plan_rainfed: { ne: "आकाशे पानीको भर", en: "Rainfed Only" },
  plan_analyze_btn: { ne: "अवसर विश्लेषण गर्नुहोस् ➔", en: "Analyze Opportunities ➔" },
  plan_analyzing: { ne: "विश्लेषण गर्दैछ...", en: "Analyzing..." },

  // Plan Results
  plan_results_title: { ne: "विश्लेषण नतिजा", en: "Analysis Results" },
  plan_results_note: {
    ne: "*कालिमाटी राष्ट्रिय थोक बजारको १० वर्षे ऐतिहासिक आधारमा विश्लेषित",
    en: "*Analyzed based on 10-year historical data from Kalimati National Wholesale Market",
  },

  // Cohorts
  cohort_a_title: {
    ne: "समूह 'क': उत्कृष्ट अनुकूलता + बलियो ऐतिहासिक प्रमाण",
    en: "Cohort A: Optimal Agronomy + High Confidence",
  },
  cohort_b_title: {
    ne: "समूह 'ख': उत्कृष्ट अनुकूलता + मध्यम प्रमाण",
    en: "Cohort B: Optimal Agronomy + Moderate Evidence",
  },
  cohort_c_title: {
    ne: "समूह 'ग': सर्तसहित कृषि अनुकूलता",
    en: "Cohort C: Conditional Agronomy",
  },
  cohort_a_badge: { ne: "🟢 उत्कृष्ट अवसर", en: "🟢 Excellent Opportunity" },
  cohort_b_badge: { ne: "🔵 राम्रो अवसर", en: "🔵 Good Opportunity" },
  cohort_c_badge: { ne: "🟡 सर्तसहित उपयुक्त", en: "🟡 Conditionally Suitable" },
  cohort_d_title: {
    ne: "अन्य उपयुक्त बालीहरू (तर बजार तथ्याङ्क अपर्याप्त रहेको)",
    en: "Other Suitable Crops (Insufficient Market Data)",
  },

  // Crop Card Labels
  crop_duration: { ne: "बाली अवधि:", en: "Crop Duration:" },
  crop_days: { ne: "दिन", en: "days" },
  crop_code: { ne: "कोड:", en: "Code:" },
  crop_harvest_time: { ne: "अनुमानित उत्पादन समय", en: "Expected Harvest Time" },
  crop_historical_price: { ne: "ऐतिहासिक औसत मूल्य", en: "Historical Avg. Price" },
  crop_seasonal_advantage: { ne: "मौसमी मूल्य फाइदा", en: "Seasonal Price Advantage" },
  crop_daily_volatility: { ne: "दैनिक उतारचढाव", en: "Daily Volatility" },
  crop_why_recommended: { ne: "किन सिफारिस गरियो?", en: "Why Recommended?" },

  // No Recommendations
  plan_no_results_title: {
    ne: "छनोट गरिएको महिनामा उपयुक्त सिफारिस भेटिएन",
    en: "No suitable recommendations found for the selected month",
  },
  plan_no_results_desc: {
    ne: "तपाईंले छान्नुभएको स्थान वा महिनामा बालीहरू सिजन बाहिर पर्छन् वा पानीको अभाव हुन सक्छ। कृपया अर्को महिना छनोट गरी हेर्नुहोस्।",
    en: "Crops may be out of season or there may be insufficient water at the selected location/month. Please try another month.",
  },

  // BS Month names
  bs_month_1: { ne: "बैशाख", en: "Baisakh" },
  bs_month_2: { ne: "जेठ", en: "Jestha" },
  bs_month_3: { ne: "असार", en: "Ashad" },
  bs_month_4: { ne: "साउन", en: "Shrawan" },
  bs_month_5: { ne: "भदौ", en: "Bhadra" },
  bs_month_6: { ne: "असोज", en: "Ashwin" },
  bs_month_7: { ne: "कार्तिक", en: "Kartik" },
  bs_month_8: { ne: "मंसिर", en: "Mangsir" },
  bs_month_9: { ne: "पुस", en: "Poush" },
  bs_month_10: { ne: "माघ", en: "Magh" },
  bs_month_11: { ne: "फागुन", en: "Falgun" },
  bs_month_12: { ne: "चैत", en: "Chaitra" },

  // Province names (used in plan page district selector)
  province_koshi: { ne: "कोशी प्रदेश", en: "Koshi Province" },
  province_madhesh: { ne: "मधेश प्रदेश", en: "Madhesh Province" },
  province_bagmati: { ne: "बागमती प्रदेश", en: "Bagmati Province" },
  province_gandaki: { ne: "गण्डकी प्रदेश", en: "Gandaki Province" },
  province_lumbini: { ne: "लुम्बिनी प्रदेश", en: "Lumbini Province" },
  province_karnali: { ne: "कर्णाली प्रदेश", en: "Karnali Province" },
  province_sudurpashchim: { ne: "सुदूरपश्चिम प्रदेश", en: "Sudurpashchim Province" },

  // District names
  dist_jhapa: { ne: "झापा", en: "Jhapa" },
  dist_sunsari: { ne: "सुनसरी", en: "Sunsari" },
  dist_dhanusha: { ne: "धनुषा", en: "Dhanusha" },
  dist_sarlahi: { ne: "सर्लाही", en: "Sarlahi" },
  dist_kathmandu: { ne: "काठमाडौं", en: "Kathmandu" },
  dist_sindhuli: { ne: "सिन्धुली", en: "Sindhuli" },
  dist_kaski: { ne: "कास्की", en: "Kaski" },
  dist_nawalpur: { ne: "नवलपुर", en: "Nawalpur" },
  dist_rupondehi: { ne: "रुपन्देही", en: "Rupandehi" },
  dist_banke: { ne: "बाँके", en: "Banke" },
  dist_surkhet: { ne: "सुर्खेत", en: "Surkhet" },
  dist_kailali: { ne: "कैलाली", en: "Kailali" },

  // Zone labels
  zone_terai: { ne: "तराई", en: "Terai" },
  zone_valley: { ne: "उपत्यका", en: "Valley" },
  zone_inner_hills: { ne: "भित्री पहाड", en: "Inner Hills" },
  zone_mid_hills: { ne: "मध्यपहाड", en: "Mid-Hills" },
  month_label: { ne: "महिना", en: "Month" },

  // ============================================================================
  // COMPARE PAGE
  // ============================================================================
  compare_title: { ne: "बजार-बजार मूल्य तुलना", en: "Regional Market Price Comparison" },
  compare_desc: {
    ne: "नेपालका १२ वटै थोक बजारहरूमा आजको संकलित थोक मूल्य र आधार बजारसँगको मूल्य भिन्नता हेर्नुहोस्।",
    en: "View today's compiled wholesale prices and price differences across all 12 wholesale markets in Nepal.",
  },
  compare_select_commodity: { ne: "१. कृषि उपज छान्नुहोस्", en: "1. Select Commodity" },
  compare_total_available: { ne: "कुल उपलब्ध:", en: "Total Available:" },
  compare_crops_count: { ne: "बालीहरू", en: "crops" },
  compare_base_market: { ne: "२. तुलना गर्ने आधार बजार", en: "2. Base Benchmark Market" },
  compare_table_title_suffix: { ne: "आजको संकलित थोक मूल्य विवरण", en: "Today's Compiled Wholesale Prices" },
  compare_unit_label: { ne: "इकाइ:", en: "Unit:" },
  th_market: { ne: "थोक बजार", en: "Wholesale Market" },
  th_gross_spread: { ne: "आधार बजारसँग फरक", en: "Gross Spread from Base" },
  compare_loading: { ne: "मूल्य तथ्याङ्क लोड हुँदैछ...", en: "Loading price data..." },
  compare_no_data: { ne: "यस बालीको लागि बजार तथ्याङ्क भेटिएन।", en: "No market data found for this commodity." },
  compare_base_badge: { ne: "आधार बजार", en: "Base Market" },
  compare_higher: { ne: "उच्च", en: "Higher" },
  compare_lower: { ne: "कम", en: "Lower" },
  compare_equal: { ne: "बराबर", en: "Equal" },
  compare_disclaimer_label: { ne: "महत्वपूर्ण सूचना:", en: "Important Notice:" },
  compare_disclaimer_text: {
    ne: "यो तालिकाले बजारहरूमा संकलित थोक मूल्य मात्र देखाउँछ। बजार बीचको मूल्य फरकमा ढुवानी तथा अन्य खर्च जोडिएको छैन।",
    en: "This table shows only compiled wholesale prices. Transportation and other costs between markets are not included in the price difference.",
  },

  // ============================================================================
  // COMMODITY DETAIL PAGE
  // ============================================================================
  commodity_not_found: { ne: "बाली फेला परेन", en: "Commodity Not Found" },
  commodity_market_label: { ne: "बजार:", en: "Market:" },
  commodity_compare_all: { ne: "📊 सबै बजारमा तुलना गर्नुहोस् ➔", en: "📊 Compare Across All Markets ➔" },
  commodity_avg_today: { ne: "आजको औसत मूल्य", en: "Today's Average Price" },
  commodity_min_today: { ne: "न्यूनतम मूल्य", en: "Minimum Price" },
  commodity_max_today: { ne: "अधिकतम मूल्य", en: "Maximum Price" },
  commodity_unit_per: { ne: "इकाइ: प्रति", en: "Unit: per" },
  commodity_min_desc: { ne: "सुरुवाती थोक दर", en: "Starting wholesale rate" },
  commodity_max_desc: { ne: "उच्चतम कारोबार दर", en: "Highest trading rate" },

  // Intelligence Tabs
  tab_seasonal: { ne: "📅 १२ महिनाको मौसमी चक्र", en: "📅 12-Month Seasonal Cycle" },
  tab_daily: { ne: "📈 दैनिक मूल्य उतारचढाव", en: "📈 Daily Price Trend" },
  tab_seasonal_status: { ne: "१० वर्षे ऐतिहासिक आधार", en: "10-Year Historical Base" },
  tab_daily_status_prefix: { ne: "पछिल्लो", en: "Last" },
  tab_daily_status_suffix: { ne: "दिनको कारोबार", en: "days of trading" },

  // Seasonal Card
  seasonal_title: { ne: "१२ महिनाको ऐतिहासिक मौसमी चक्र", en: "12-Month Historical Seasonal Pattern" },
  seasonal_desc: {
    ne: "विगत १० वर्षको वास्तविक कारोबारको मासिक औसत मूल्य प्रवृत्तिको आधारमा",
    en: "Based on the monthly average price trend from actual trading over the past 10 years",
  },
  seasonal_confidence: { ne: "१० वर्षे तथ्याङ्क", en: "10-Year Data" },
  seasonal_no_data: {
    ne: "यस वस्तुको १० वर्षे दीर्घकालीन मौसमी चक्र तथ्याङ्क उपलब्ध छैन",
    en: "Long-term 10-year seasonal cycle data is not available for this commodity",
  },
  seasonal_no_data_desc: {
    ne: "यो वस्तु कालिमाटीको ऐतिहासिक फलफूल तथा तरकारी बोर्डमा समावेश नभएको वा नयाँ सूचीकृत भएको कारण १० वर्षे मौसमी चक्र उपलब्ध छैन।",
    en: "This commodity is either not included in Kalimati's historical records or is newly listed, so 10-year seasonal cycle is unavailable.",
  },
  seasonal_view_daily_btn: { ne: "📈 हालैको दैनिक मूल्य उतारचढाव हेर्नुहोस् ➔", en: "📈 View Recent Daily Price Trends ➔" },

  // Daily Trend
  daily_title: { ne: "हालैको दैनिक मूल्य उतारचढाव", en: "Recent Daily Price Fluctuation Trend" },
  daily_desc: {
    ne: "विगतका कारोबार दिनहरूको दैनिक मूल्य घटबढ (न्यूनतम, औसत र अधिकतम दर)",
    en: "Daily price movement from recent trading days (minimum, average, and maximum rates)",
  },
  daily_trend_badge: { ne: "दैनिक बजार ट्रेन्ड", en: "Daily Market Trend" },
  daily_notice: {
    ne: "दैनिक हरियो रेखाले प्रतिनिधि औसत दर र डटेड रेखाले न्यूनतम/अधिकतम मूल्यको ब्यान्ड देखाउँछ।",
    en: "The green line represents the average price and the dotted lines show the min/max price band.",
  },
  daily_notice_label: { ne: "सूचना:", en: "Note:" },
  daily_no_data: { ne: "दैनिक कारोबार तथ्याङ्क उपलब्ध छैन।", en: "No daily trading data available." },

  // Crop Calendar Card
  calendar_title: { ne: "१२ महिनाको बाली तथा बजार अवसर क्यालेन्डर", en: "12-Month Crop & Market Opportunity Calendar" },
  calendar_desc: {
    ne: "कुन महिनामा मूल्य उच्च रहन्छ र कुन महिनामा बजारमा अत्यधिक आपूर्ति (सस्तो) हुन्छ?",
    en: "Which months have high prices and which months see oversupply (cheaper)?",
  },
  calendar_highest: { ne: "🔥 उच्चतम:", en: "🔥 Highest:" },
  calendar_cheapest: { ne: "📉 सस्तो:", en: "📉 Cheapest:" },
  calendar_high_price: { ne: "🔥 उच्च मूल्य", en: "🔥 High Price" },
  calendar_cheap_market: { ne: "📉 सस्तो बजार", en: "📉 Cheap Market" },
  calendar_normal: { ne: "⚖ सामान्य", en: "⚖ Normal" },
  calendar_advisory_label: { ne: "💡 किसानका लागि सुझाव:", en: "💡 Farmer Advisory:" },
  calendar_advisory_text: {
    ne: "खेती गर्दा उच्च मूल्य समात्न करिब ६०–८० दिन अगावै रोपाइँ वा टनेल/बेमौसमी प्रविधि प्रयोग गर्न सिफारिस गरिन्छ।",
    en: "To catch peak prices, plant 60–80 days in advance or use tunnel/off-season technology.",
  },
  calendar_glut_note: {
    ne: "महिनामा मुख्य उत्पादन सबै क्षेत्रबाट एकैपटक बजारमा आउने हुँदा मूल्यमा भारी गिरावट आउने गरेको छ।",
    en: "month sees a heavy price drop as main production from all areas arrives at the market simultaneously.",
  },

  // Risk Profile
  risk_daily_volatility: { ne: "📊 दैनिक मूल्य उतारचढाव", en: "📊 Daily Price Volatility" },
  risk_daily_desc: { ne: "महिनाभित्र दैनिक मूल्यमा हुने स्वाभाविक घटबढ।", en: "Natural daily price fluctuation within the month." },
  risk_annual_variability: { ne: "🌱 वर्षगत उत्पादन स्थिरता", en: "🌱 Annual Production Stability" },
  risk_annual_desc: {
    ne: "प्रत्येक वर्ष यस महिनाको औसत मूल्य कति स्थिर रहन्छ भनी नाप्ने परिसूचक।",
    en: "An indicator measuring how stable the average price of this month remains each year.",
  },
  risk_high_confidence: { ne: "उच्च ऐतिहासिक तथ्याङ्क विश्वसनीयता", en: "High Historical Data Confidence" },
  risk_moderate_confidence: { ne: "मध्यम ऐतिहासिक तथ्याङ्क", en: "Moderate Historical Data" },

  // Chart Tooltips
  chart_avg_price: { ne: "औसत मूल्य", en: "Average Price" },
  chart_max: { ne: "अधिकतम", en: "Maximum" },
  chart_min: { ne: "न्यूनतम", en: "Minimum" },
  chart_date_label: { ne: "मिति:", en: "Date:" },
  chart_bs_suffix: { ne: "(वि.सं.)", en: "(BS)" },
  chart_month_label: { ne: "महिना:", en: "Month:" },
  chart_seasonal_no_data: { ne: "मौसमी तथ्याङ्क उपलब्ध छैन।", en: "No seasonal data available." },

  // ============================================================================
  // METHODOLOGY PAGE
  // ============================================================================
  meth_badge: { ne: "पारदर्शिता तथा प्राविधिक आधार", en: "Transparency & Governance" },
  meth_title: { ne: "तथ्याङ्क स्रोत, गणना विधि तथा प्रणाली निर्देशिका", en: "Data Sources, Calculation Methods & System Guidelines" },
  meth_desc: {
    ne: "KrishiLens Nepal ले किसानहरूलाई सही र भरपर्दो निर्णय लिन सहयोग पुर्याउन प्रयोग गरेका आधिकारिक सरकारी स्रोत, गणितीय सूत्र र विश्लेषण विधिहरू।",
    en: "Official government sources, mathematical formulas, and analytical methods used by KrishiLens Nepal to help farmers make accurate and reliable decisions.",
  },

  // Section 1
  meth_s1_title: { ne: "१. आधिकारिक तथ्याङ्क स्रोतहरू", en: "1. Official Data Sources" },
  meth_ampis_title: { ne: "कृषि बजार मूल्य सूचना प्रणाली (AMPIS)", en: "Agriculture Market Price Information System (AMPIS)" },
  meth_ampis_desc: {
    ne: "कृषि तथा पशुपन्छी विकास मन्त्रालय, कृषि विभाग अन्तर्गत सञ्चालित नेपालका १२ वटै प्रमुख संघीय कृषि थोक बजारहरूको दैनिक थोक मूल्य अभिलेख।",
    en: "Daily wholesale price records from all 12 major federal agricultural wholesale markets in Nepal, operated under the Ministry of Agriculture and the Department of Agriculture.",
  },
  meth_kalimati_title: { ne: "कालिमाटी फलफूल तथा तरकारी बजार विकास बोर्ड", en: "Kalimati Fruits and Vegetables Market Development Board" },
  meth_kalimati_desc: {
    ne: "नेपालको केन्द्रीय राष्ट्रिय थोक बजारको दैनिक न्यूनतम, अधिकतम र अंकगणितीय औसत कारोबार मूल्य तथा १२ वर्षभन्दा लामो ऐतिहासिक अभिलेख।",
    en: "Daily minimum, maximum, and arithmetic average trading prices and over 12 years of historical records from Nepal's central national wholesale market.",
  },
  meth_aitc_title: { ne: "कृषि सूचना तथा प्रशिक्षण केन्द्र (AITC)", en: "Agriculture Information and Training Centre (AITC)" },
  meth_aitc_desc: {
    ne: "आधिकारिक कृषि तथा पशुपन्छी डायरी (२०८२/२०८३) बाट प्राप्त तराई, मध्यपहाड र उच्चपहाडका लागि बाली अनुसारको आधिकारिक रोपाइँ क्यालेन्डर तथा अवधि।",
    en: "Official planting calendar and crop durations for Terai, Mid-Hills, and High-Hills from the official Agricultural Diary (2082/2083).",
  },

  // Section 2
  meth_s2_title: { ne: "२. बजार मूल्य गणना विधि", en: "2. Market Pricing Methodologies" },
  meth_s2_desc: {
    ne: "नेपाल सरकारको आधिकारिक प्राविधिक टिपोट अनुसार विभिन्न बजारहरूमा मूल्य गणना गर्ने विधि फरक-फरक हुन्छ। हाम्रो प्रणालीले स्रोतको गणना विधिलाई स्पष्ट रूपमा वर्गीकरण गर्दछ:",
    en: "According to the Government of Nepal's official technical notes, pricing methodologies differ across markets. Our system explicitly classifies each source's methodology:",
  },
  meth_midpoint_title: { ne: "क्षेत्रीय मध्यविन्दु विधि", en: "Regional Midpoint Method" },
  meth_midpoint_desc: {
    ne: "कालिमाटी बाहेकका अन्य ११ वटा क्षेत्रीय थोक बजारहरूमा बिहानको न्यूनतम र अधिकतम दरको औसत लिइन्छ:",
    en: "For the 11 regional wholesale markets other than Kalimati, the average of morning minimum and maximum rates is taken:",
  },
  meth_midpoint_formula: {
    ne: "प्रतिनिधि मूल्य = (न्यूनतम मूल्य + अधिकतम मूल्य) ÷ २",
    en: "Representative Price = (Minimum Price + Maximum Price) ÷ 2",
  },
  meth_mean_title: { ne: "कालिमाटी अंकगणितीय औसत", en: "Kalimati Arithmetic Mean" },
  meth_mean_desc: {
    ne: "कालिमाटी बजारमा बिहानको कारोबारको क्रममा विभिन्न स्टलहरूबाट संकलित मूल्यहरूको वास्तविक अंकगणितीय औसत निकालिन्छ:",
    en: "The actual arithmetic average of prices collected from various stalls during morning trading at Kalimati market:",
  },
  meth_mean_formula: {
    ne: "औसत मूल्य = ∑ (संकलित मूल्यहरू) ÷ जम्मा कारोबार संख्या",
    en: "Avg. Price = Σ (Collected Prices) ÷ Total Trades",
  },

  // Section 3
  meth_s3_title: { ne: "३. गणितीय सूत्र तथा जोखिम विश्लेषण", en: "3. Mathematical Formulas & Risk Analysis" },
  meth_spi_title: { ne: "क. मौसमी मूल्य सूचकाङ्क (SPI)", en: "a. Seasonal Price Index (SPI)" },
  meth_spi_desc: {
    ne: "कुनै महिनाको ऐतिहासिक मूल्य वर्षभरीको औसतभन्दा कति प्रतिशत माथि वा तल रहन्छ भनी नाप्ने सूचकाङ्क।",
    en: "An index measuring what percentage above or below the annual average a month's historical price stands.",
  },
  meth_spi_formula: {
    ne: "SPI = (महिनाको ऐतिहासिक मध्यिका मूल्य ÷ वर्षभरीको कुल वार्षिक औसत) × १००",
    en: "SPI = (Monthly Historical Median Price ÷ Total Annual Average) × 100",
  },
  meth_spi_note: {
    ne: "*नियम: १२ वटै नेपाली महिनाको पूर्ण तथ्याङ्क नभएसम्म प्रणालीले कृत्रिम मौसमी फाइदा देखाउँदैन (SPI = NULL)।",
    en: "*Rule: The system does not show artificial seasonal advantage (SPI = NULL) until complete data for all 12 Nepali months is available.",
  },
  meth_cv_title: { ne: "ख. दोहोरो बजार जोखिम विश्लेषण (CV)", en: "b. Dual Market Risk Modeling (CV)" },
  meth_cv_desc: {
    ne: "मूल्य उतारचढावलाई दुई भिन्न कोणबाट मूल्याङ्कन गरिन्छ:",
    en: "Price volatility is evaluated from two different angles:",
  },
  meth_cv_daily: {
    ne: "दैनिक उतारचढाव (Daily Volatility): महिनाभित्र दिनहुँ हुने मूल्य घटबढ। (१५% भन्दा कम: स्थिर, ३०% भन्दा माथि: उच्च जोखिम)।",
    en: "Daily Volatility: Daily price fluctuation within a month. (Under 15%: Stable, Above 30%: High Risk).",
  },
  meth_cv_annual: {
    ne: "वर्षगत उत्पादन स्थिरता (Annual Variability): विगतका वर्षहरूमा यस महिनाको औसत मूल्य कति स्थिर रह्यो भनी नाप्ने विधि।",
    en: "Annual Variability: A measure of how stable the average price of this month has remained over past years.",
  },
  meth_hcs_title: { ne: "ग. ऐतिहासिक तथ्याङ्क विश्वसनीयता (HCS)", en: "c. Historical Confidence Score (HCS)" },
  meth_hcs_desc: {
    ne: "सिफारिस कति बलियो तथ्याङ्कमा आधारित छ भनी देखाउने स्कोर (० देखि १००):",
    en: "A score (0 to 100) showing how strong the data supporting a recommendation is:",
  },
  meth_hcs_high: {
    ne: "उच्च विश्वसनीयता (High Confidence): कम्तीमा ५ वर्षको नियमित तथ्याङ्क भएको (HCS ≥ ७५)।",
    en: "High Confidence: At least 5 years of regular data (HCS ≥ 75).",
  },
  meth_hcs_moderate: {
    ne: "मध्यम विश्वसनीयता (Moderate Evidence): ३ देखि ४ वर्षको तथ्याङ्क (५० ≤ HCS < ७५)।",
    en: "Moderate Evidence: 3 to 4 years of data (50 ≤ HCS < 75).",
  },
  meth_hcs_preliminary: {
    ne: "प्रारम्भिक प्रमाण (Preliminary Evidence): २ वर्षको तथ्याङ्क (HCS < ५०)।",
    en: "Preliminary Evidence: 2 years of data (HCS < 50).",
  },

  // Section 4
  meth_s4_title: { ne: "४. बाली सिफारिस समूहहरू (Phase 3.4-A1)", en: "4. Crop Recommendation Cohorts (Phase 3.4-A1)" },
  meth_s4_desc: {
    ne: "प्रणालीले कुनै एउटा बालीलाई पहिलो (१ नम्बर) भनी दाबी गर्दैन। यसले बालीहरूलाई स्पष्ट वैज्ञानिक समूहहरूमा विभाजन गर्दछ:",
    en: "The system does not rank any single crop as #1. Instead, it groups crops into clear scientific cohorts:",
  },
  meth_cohort_a: {
    ne: "समूह 'क': उत्कृष्ट अनुकूलता + बलियो प्रमाण",
    en: "Cohort A: Optimal Suitability + Strong Evidence",
  },
  meth_cohort_a_desc: {
    ne: "उचाइ, सिँचाइ र रोपाइँ समय पूर्ण अनुकूल भएको र ५ वर्षभन्दा लामो बलियो बजार तथ्याङ्क भएको।",
    en: "Full agro-climatic suitability (altitude, irrigation, planting time) with over 5 years of strong market data.",
  },
  meth_cohort_b: {
    ne: "समूह 'ख': उत्कृष्ट अनुकूलता + मध्यम/प्रारम्भिक प्रमाण",
    en: "Cohort B: Optimal Suitability + Moderate/Preliminary Evidence",
  },
  meth_cohort_b_desc: {
    ne: "कृषि रूपमा पूर्ण अनुकूल तर बजार तथ्याङ्क २ देखि ४ वर्षको मात्र उपलब्ध भएको।",
    en: "Agronomically fully suitable but only 2 to 4 years of market data available.",
  },
  meth_cohort_c: {
    ne: "समूह 'ग': सर्तसहित कृषि अनुकूलता",
    en: "Cohort C: Conditional Agronomy",
  },
  meth_cohort_c_desc: {
    ne: "सिँचाइको कमी वा उचाइ सीमाको छेउछाउमा रहेका बालीहरू जहाँ किसानले विशेष सतर्कता अपनाउनुपर्छ।",
    en: "Crops near irrigation or altitude limits where farmers must exercise special caution.",
  },
  meth_cohort_d: {
    ne: "समूह 'घ': कृषि अनुकूल तर बजार तथ्याङ्क अपर्याप्त",
    en: "Cohort D: Agronomically Suitable but Insufficient Market Data",
  },
  meth_cohort_d_desc: {
    ne: "लगाउन सकिने तर स्थानीय थोक बजारमा विगतको मूल्य तथ्याङ्क न्यून भएको बालीहरू।",
    en: "Can be grown but have insufficient historical price data in local wholesale markets.",
  },

  // Section 5
  meth_s5_title: { ne: "⚠ महत्वपूर्ण कानूनी तथा प्राविधिक सीमाहरू", en: "⚠ Crucial Legal & Technical Limitations" },
  meth_limit_1_title: {
    ne: "१. थोक बजार मूल्य ≠ किसानको नाफा",
    en: "1. Wholesale Price ≠ Farmer's Profit",
  },
  meth_limit_1_desc: {
    ne: "यहाँ देखाइएको मूल्य थोक बजारको कारोबार दर हो। किसानको खेतबाट बजारसम्म पुर्याउँदा ढुवानी खर्च, प्याकिङ, बाटोको नोक्सानी र बिचौलियाको नाफा घट्ने हुँदा किसानले पाउने वास्तविक खेतको मूल्य (Farmgate Price) थोक दरभन्दा सामान्यतया २०% देखि ३५% कम हुन सक्छ।",
    en: "The prices shown here are wholesale market trading rates. Due to transportation costs, packaging, transit losses, and middleman margins from farm to market, the actual farmgate price farmers receive is typically 20% to 35% lower than the wholesale rate.",
  },
  meth_limit_2_title: {
    ne: "२. मागको अनुमान निषेध",
    en: "2. Prohibition of Inferred Demand",
  },
  meth_limit_2_desc: {
    ne: "प्रणालीले केवल उच्च मूल्य देखेर \"माग बढी छ\" भनी दाबी गर्दैन। बजारमा वास्तविक आयात/आगमन परिमाण नभएसम्म मूल्यलाई मात्र माग मान्न सकिँदैन।",
    en: "The system does not claim \"demand is high\" just because prices are high. Without actual import/arrival volume data, price alone cannot be taken as demand.",
  },
  meth_limit_3_title: {
    ne: "३. भविष्यको मूल्य ग्यारेन्टी होइन",
    en: "3. Not a Price Forecast",
  },
  meth_limit_3_desc: {
    ne: "यो प्रणालीले विगतका वर्षहरूको मौसमी प्रवृत्तिको विश्लेषण गर्दछ। असामान्य मौसम, बाढी-पहिरो वा अन्तर्राष्ट्रिय आयात-निर्यात नीतिका कारण भविष्यमा मूल्य फरक पर्न सक्छ।",
    en: "This system analyzes seasonal trends from past years. Prices may differ in the future due to unusual weather, floods/landslides, or international import-export policies.",
  },

  // Tech footer
  meth_tech_version: {
    ne: "सञ्चालित कार्यविधि संस्करण:",
    en: "Active Methodology Version:",
  },
  meth_param_config: {
    ne: "पारामिटर कन्फिगरेसन:",
    en: "Parameter Configuration:",
  },
  meth_platform_tag: {
    ne: "KrishiLens Nepal — Open Agricultural Market Intelligence Platform",
    en: "KrishiLens Nepal — Open Agricultural Market Intelligence Platform",
  },

  // ============================================================================
  // LANGUAGE TOGGLE
  // ============================================================================
  lang_switch_label: { ne: "EN", en: "ने" },
} as const;

// Category mapping: maps the DB categoryNe value to a translation key
export const CATEGORY_NE_TO_KEY: Record<string, keyof typeof translations> = {
  "सबै": "cat_all",
  "तरकारी": "cat_vegetables",
  "खाद्यान्न बाली": "cat_grains",
  "दुग्धजन्य": "cat_dairy",
  "मासु": "cat_meat",
  "फलफूल": "cat_fruits",
  "मसला बाली": "cat_spices",
  "सागपात": "cat_leafy",
  "च्याउ खेती": "cat_mushroom",
  "कन्दमुल बाली": "cat_tuber",
  "कोसे / दाल बाली": "cat_legumes",
  "माछा": "cat_fish",
};

export type TranslationKey = keyof typeof translations;
