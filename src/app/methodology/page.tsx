export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Title Header */}
        <div className="border-b pb-4">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            पारदर्शिता तथा प्राविधिक आधार (Transparency & Governance)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            तथ्याङ्क स्रोत, गणना विधि तथा प्रणाली निर्देशिका
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            KrishiLens Nepal ले किसानहरूलाई सही र भरपर्दो निर्णय लिन सहयोग पुर्याउन प्रयोग गरेका आधिकारिक सरकारी स्रोत, गणितीय सूत्र र विश्लेषण विधिहरू।
          </p>
        </div>

        {/* Section 1: Official Data Sources */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">🏛</span>
            <h2 className="text-lg font-bold text-slate-900">१. आधिकारिक तथ्याङ्क स्रोतहरू (Official Data Sources)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h3 className="font-bold text-slate-900">कृषि बजार मूल्य सूचना प्रणाली (AMPIS)</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                कृषि तथा पशुपन्छी विकास मन्त्रालय, कृषि विभाग अन्तर्गत सञ्चालित नेपालका १२ वटै प्रमुख संघीय कृषि थोक बजारहरूको दैनिक थोक मूल्य अभिलेख।
              </p>
              <span className="inline-block text-[11px] text-emerald-700 font-mono">ampis.gov.np</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h3 className="font-bold text-slate-900">कालिमाटी फलफूल तथा तरकारी बजार विकास बोर्ड</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                नेपालको केन्द्रीय राष्ट्रिय थोक बजारको दैनिक न्यूनतम, अधिकतम र अंकगणितीय औसत कारोबार मूल्य तथा १२ वर्षभन्दा लामो ऐतिहासिक अभिलेख।
              </p>
              <span className="inline-block text-[11px] text-emerald-700 font-mono">kalimatimarket.gov.np</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h3 className="font-bold text-slate-900">कृषि सूचना तथा प्रशिक्षण केन्द्र (AITC)</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                आधिकारिक कृषि तथा पशुपन्छी डायरी (२०८२/२०८३) बाट प्राप्त तराई, मध्यपहाड र उच्चपहाडका लागि बाली अनुसारको आधिकारिक रोपाइँ क्यालेन्डर तथा अवधि।
              </p>
              <span className="inline-block text-[11px] text-emerald-700 font-mono">aitc.gov.np</span>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing Methodologies */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">⚖</span>
            <h2 className="text-lg font-bold text-slate-900">२. बजार मूल्य गणना विधि (Pricing Methodologies)</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            नेपाल सरकारको आधिकारिक प्राविधिक टिपोट अनुसार विभिन्न बजारहरूमा मूल्य गणना गर्ने विधि फरक-फरक हुन्छ। हाम्रो प्रणालीले स्रोतको गणना विधिलाई स्पष्ट रूपमा वर्गीकरण गर्दछ:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="border border-slate-200 p-4 rounded-xl space-y-1 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">क्षेत्रीय मध्यविन्दु विधि (Regional Midpoint)</h3>
              <p className="text-xs text-slate-600">
                कालिमाटी बाहेकका अन्य ११ वटा क्षेत्रीय थोक बजारहरूमा बिहानको न्यूनतम र अधिकतम दरको औसत लिइन्छ:
              </p>
              <div className="font-mono bg-white p-2 rounded border text-center text-xs font-bold text-emerald-800 my-2">
                प्रतिनिधि मूल्य = (न्यूनतम मूल्य + अधिकतम मूल्य) ÷ २
              </div>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl space-y-1 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">कालिमाटी अंकगणितीय औसत (Arithmetic Mean)</h3>
              <p className="text-xs text-slate-600">
                कालिमाटी बजारमा बिहानको कारोबारको क्रममा विभिन्न स्टलहरूबाट संकलित मूल्यहरूको वास्तविक अंकगणितीय औसत निकालिन्छ:
              </p>
              <div className="font-mono bg-white p-2 rounded border text-center text-xs font-bold text-emerald-800 my-2">
                औसत मूल्य = ∑ (संकलित मूल्यहरू) ÷ जम्मा कारोबार संख्या
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Mathematical Analytics Explained */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">📐</span>
            <h2 className="text-lg font-bold text-slate-900">३. गणितीय सूत्र तथा जोखिम विश्लेषण (Mathematical Analytics)</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="border-l-4 border-emerald-600 pl-4 py-1 space-y-1">
              <h3 className="font-bold text-slate-900">क. मौसमी मूल्य सूचकाङ्क (Seasonal Price Index - SPI)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                कुनै महिनाको ऐतिहासिक मूल्य वर्षभरीको औसतभन्दा कति प्रतिशत माथि वा तल रहन्छ भनी नाप्ने सूचकाङ्क।
              </p>
              <p className="font-mono text-xs text-emerald-800 bg-slate-100 p-2 rounded inline-block">
                SPI = (महिनाको ऐतिहासिक मध्यिका मूल्य ÷ वर्षभरीको कुल वार्षिक औसत) × १००
              </p>
              <p className="text-[11px] text-slate-500 italic">
                *नियम: १२ वटै नेपाली महिनाको पूर्ण तथ्याङ्क नभएसम्म प्रणालीले कृत्रिम मौसमी फाइदा देखाउँदैन (SPI = NULL)।
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4 py-1 space-y-1">
              <h3 className="font-bold text-slate-900">ख. दोहोरो बजार जोखिम विश्लेषण (Dual Risk Modeling: CV)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                मूल्य उतारचढावलाई दुई भिन्न कोणबाट मूल्याङ्कन गरिन्छ:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                <li><strong>दैनिक उतारचढाव (Daily Volatility):</strong> महिनाभित्र दिनहुँ हुने मूल्य घटबढ। (१५% भन्दा कम: स्थिर, ३०% भन्दा माथि: उच्च जोखिम)।</li>
                <li><strong>वर्षगत उत्पादन स्थिरता (Annual Variability):</strong> विगतका वर्षहरूमा यस महिनाको औसत मूल्य कति स्थिर रह्यो भनी नाप्ने विधि।</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-600 pl-4 py-1 space-y-1">
              <h3 className="font-bold text-slate-900">ग. ऐतिहासिक तथ्याङ्क विश्वसनीयता (Historical Confidence Score - HCS)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                सिफारिस कति बलियो तथ्याङ्कमा आधारित छ भनी देखाउने स्कोर (० देखि १००):
              </p>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                <li><strong>उच्च विश्वसनीयता (High Confidence):</strong> कम्तीमा ५ वर्षको नियमित तथ्याङ्क भएको (HCS ≥ ७५)।</li>
                <li><strong>मध्यम विश्वसनीयता (Moderate Evidence):</strong> ३ देखि ४ वर्षको तथ्याङ्क (५० ≤ HCS &lt; ७५)।</li>
                <li><strong>प्रारम्भिक प्रमाण (Preliminary Evidence):</strong> २ वर्षको तथ्याङ्क (HCS &lt; ५०)।</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Cohorts and Strict Invariants */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="text-xl">🎯</span>
            <h2 className="text-lg font-bold text-slate-900">४. बाली सिफारिस समूहहरू (Decision Cohorts - Phase 3.4-A1)</h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            प्रणालीले कुनै एउटा बालीलाई पहिलो (१ नम्बर) भनी दाबी गर्दैन। यसले बालीहरूलाई स्पष्ट वैज्ञानिक समूहहरूमा विभाजन गर्दछ:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-1">
              <span className="font-bold text-emerald-900">{"समूह 'क': उत्कृष्ट अनुकूलता + बलियो प्रमाण"}</span>
              <p className="text-slate-600">उचाइ, सिँचाइ र रोपाइँ समय पूर्ण अनुकूल भएको र ५ वर्षभन्दा लामो बलियो बजार तथ्याङ्क भएको।</p>
            </div>

            <div className="p-3.5 rounded-xl border border-teal-300 bg-teal-50/50 space-y-1">
              <span className="font-bold text-teal-900">{"समूह 'ख': उत्कृष्ट अनुकूलता + मध्यम/प्रारम्भिक प्रमाण"}</span>
              <p className="text-slate-600">कृषि रूपमा पूर्ण अनुकूल तर बजार तथ्याङ्क २ देखि ४ वर्षको मात्र उपलब्ध भएको।</p>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 space-y-1">
              <span className="font-bold text-amber-900">{"समूह 'ग': सर्तसहित कृषि अनुकूलता"}</span>
              <p className="text-slate-600">सिँचाइको कमी वा उचाइ सीमाको छेउछाउमा रहेका बालीहरू जहाँ किसानले विशेष सतर्कता अपनाउनुपर्छ।</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-100 space-y-1">
              <span className="font-bold text-slate-800">{"समूह 'घ': कृषि अनुकूल तर बजार तथ्याङ्क अपर्याप्त"}</span>
              <p className="text-slate-600">लगाउन सकिने तर स्थानीय थोक बजारमा विगतको मूल्य तथ्याङ्क न्यून भएको बालीहरू।</p>
            </div>
          </div>
        </section>

        {/* Section 5: Crucial Limitations & Agricultural Ethics */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 space-y-3">
          <h2 className="font-bold text-amber-950 text-base flex items-center gap-2">
            <span>⚠</span> महत्वपूर्ण कानूनी तथा प्राविधिक सीमाहरू (Crucial Limitations)
          </h2>

          <div className="space-y-2 text-xs text-amber-900 leading-relaxed">
            <p>
              <strong>१. थोक बजार मूल्य ≠ किसानको नाफा (Wholesale Price ≠ Farmgate Profit):</strong> यहाँ देखाइएको मूल्य थोक बजारको कारोबार दर हो। किसानको खेतबाट बजारसम्म पुर्याउँदा ढुवानी खर्च, प्याकिङ, बाटोको नोक्सानी र बिचौलियाको नाफा घट्ने हुँदा किसानले पाउने वास्तविक खेतको मूल्य (Farmgate Price) थोक दरभन्दा सामान्यतया २०% देखि ३५% कम हुन सक्छ।
            </p>
            <p>
              <strong>२. मागको अनुमान निषेध (Prohibition of Inferred Demand):</strong> प्रणालीले केवल उच्च मूल्य देखेर &quot;माग बढी छ&quot; भनी दाबी गर्दैन। बजारमा वास्तविक आयात/आगमन परिमाण नभएसम्म मूल्यलाई मात्र माग मान्न सकिँदैन।
            </p>
            <p>
              <strong>३. भविष्यको मूल्य ग्यारेन्टी होइन (Not a Price Forecast):</strong> यो प्रणालीले विगतका वर्षहरूको मौसमी प्रवृत्तिको विश्लेषण गर्दछ। असामान्य मौसम, बाढी-पहिरो वा अन्तर्राष्ट्रिय आयात-निर्यात नीतिका कारण भविष्यमा मूल्य फरक पर्न सक्छ।
            </p>
          </div>
        </section>

        {/* Technical Metadata Footer */}
        <footer className="text-center text-xs text-slate-400 space-y-1 pt-4 border-t">
          <p>सञ्चालित कार्यविधि संस्करण: <span className="font-mono text-slate-600">v1.1-phase3.4-A1</span> • पारामिटर कन्फिगरेसन: <span className="font-mono text-slate-600">param-v1.0-defaults</span></p>
          <p>KrishiLens Nepal — Open Agricultural Market Intelligence Platform</p>
        </footer>
      </main>
    </div>
  );
}