export const schemesData = [
    {
        name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
        shortDescription: 'Financial assistance of ₹5,000 to pregnant women and lactating mothers for health and nutrition.',
        fullDescription: 'Pradhan Mantri Matru Vandana Yojana (PMMVY) is a direct benefit transfer (DBT) scheme implemented by the Ministry of Women and Child Development. It provides financial incentives to pregnant women and lactating mothers for the first living child to promote health-seeking behavior and compensate for wage loss.',
        category: 'Maternity',
        governmentLevel: 'Central',
        ministry: 'Ministry of Women and Child Development',
        state: 'All India',
        benefits: [
            'Financial incentive of ₹5,000 paid in installments directly into bank/post office account.',
            'Covers nutrition, ante-natal check-ups, and institutional delivery support.',
            'Additional benefits under Janani Suraksha Yojana (JSY) for institutional delivery.'
        ],
        eligibility: [
            'Pregnant women and lactating mothers for their first child.',
            'Age of the applicant must be 19 years or above.',
            'Must not be employed with Central/State Government or PSUs.'
        ],
        documentsRequired: [
            'Aadhaar Card of Mother & Husband',
            'Bank / Post Office Passbook copy linked with Aadhaar',
            'Mother and Child Protection (MCP) Card',
            'Identity Proof & Address Proof'
        ],
        applicationProcess: [
            'Visit the official PMMVY Portal (pmmvy.wcd.gov.in) or nearest Anganwadi Centre.',
            'Fill out Form 1A for registration and submit required documents.',
            'Submit Form 1B after at least one antenatal checkup.',
            'Submit Form 1C after child birth registration and first cycle of vaccinations.'
        ],
        applicationUrl: 'https://pmmvy.wcd.gov.in/',
        officialWebsite: 'https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana',
        targetAudience: ['Pregnant women', 'Lactating mothers', 'Low-income families'],
        tags: ['maternity', 'pregnancy', 'health', 'cash incentive', 'women health'],
        featured: true,
        lastVerifiedAt: new Date('2026-01-15')
    },
    {
        name: 'Sukanya Samriddhi Yojana (SSY)',
        shortDescription: 'High-interest small deposit savings scheme for girl children offering tax-free returns under Section 80C.',
        fullDescription: 'Sukanya Samriddhi Yojana (SSY) is a government-backed savings scheme launched under the Beti Bachao Beti Padhao campaign. It enables parents to build a dedicated financial fund for the higher education and marriage of their girl child with lucrative government-backed interest rates.',
        category: 'Financial Assistance',
        governmentLevel: 'Central',
        ministry: 'Ministry of Finance',
        state: 'All India',
        benefits: [
            'High compound interest rate updated quarterly by Government of India.',
            'Tax exemption under Section 80C up to ₹1.5 Lakh per annum.',
            'Tax-free maturity proceeds and interest earned.',
            'Partial withdrawal permitted for higher education after girl child turns 18.'
        ],
        eligibility: [
            'Girl child must be a resident Indian citizen.',
            'Account opened by legal guardian before girl child reaches 10 years of age.',
            'Maximum of two accounts allowed per family (three in case of twins/triplets).'
        ],
        documentsRequired: [
            'Girl Child Birth Certificate',
            'Identity & Address Proof of Guardian (Aadhaar / PAN / Passport)',
            'Passport size photograph of child and guardian',
            'Initial deposit amount (minimum ₹250)'
        ],
        applicationProcess: [
            'Visit any authorized Post Office or public/private commercial bank branch.',
            'Obtain and fill the SSY Account Opening Form.',
            'Submit form along with birth certificate and guardian KYC documents.',
            'Deposit initial amount to activate the account.'
        ],
        applicationUrl: 'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx',
        officialWebsite: 'https://www.nsiindia.gov.in/',
        targetAudience: ['Girls', 'Parents', 'Low-income families'],
        tags: ['savings', 'girl child', 'tax saving', 'education fund', 'post office'],
        featured: true,
        lastVerifiedAt: new Date('2026-01-20')
    },
    {
        name: 'Stand Up India Scheme for Women Entrepreneurs',
        shortDescription: 'Bank loans between ₹10 Lakh and ₹1 Crore for women establishing greenfield enterprises.',
        fullDescription: 'Stand Up India Scheme aims to facilitate bank loans between ₹10 Lakh and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise in manufacturing, services, or trading sector.',
        category: 'Entrepreneurship',
        governmentLevel: 'Central',
        ministry: 'Ministry of Finance',
        state: 'All India',
        benefits: [
            'Loan amounts from ₹10 Lakh up to ₹1 Crore for business startup.',
            'Composite loan covering term loan and working capital.',
            'Repayable in 7 years with a maximum moratorium period of 18 months.',
            'Handholding support via Stand Up India portal.'
        ],
        eligibility: [
            'Applicant must be a woman entrepreneur aged 18 years or above.',
            'Enterprise must be a Greenfield project (first-time business Venture).',
            'If non-individual enterprise, 51% shareholding & controlling stake held by woman.'
        ],
        documentsRequired: [
            'Aadhaar Card, PAN Card, & Voter ID',
            'Project Report & Detailed Business Plan',
            'Proof of Business Premises / Rent Agreement',
            'Bank Account Statements for last 6 months',
            'Category/Caste Certificate (if applying under SC/ST)'
        ],
        applicationProcess: [
            'Register on Stand Up India portal (www.standupmitra.in).',
            'Fill online application form and select preferred lending bank branch.',
            'Upload business project plan and required KYC documents.',
            'Meet with bank branch manager for loan appraisal and sanction.'
        ],
        applicationUrl: 'https://www.standupmitra.in/',
        officialWebsite: 'https://www.standupmitra.in/',
        targetAudience: ['Women entrepreneurs', 'Working women', 'Job seekers'],
        tags: ['loans', 'women business', 'startup', 'entrepreneurship', 'bank financing'],
        featured: true,
        lastVerifiedAt: new Date('2026-02-01')
    },
    {
        name: 'Mahila Samriddhi Yojana (Mudra Loans for Women)',
        shortDescription: 'Collateral-free micro loans up to ₹10 Lakh for women entrepreneurs and self-help groups.',
        fullDescription: 'Under Pradhan Mantri MUDRA Yojana (PMMY), special financial assistance and concessional interest rates are extended to women entrepreneurs starting micro-enterprises under Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 Lakh), and Tarun (₹5 Lakh to ₹10 Lakh) categories.',
        category: 'Entrepreneurship',
        governmentLevel: 'Central',
        ministry: 'Ministry of Micro, Small and Medium Enterprises',
        state: 'All India',
        benefits: [
            'Collateral-free financial loans up to ₹10 Lakh.',
            'Flexible repayment tenure up to 5 years.',
            'MUDRA Card provided for hassle-free working capital withdrawals.',
            'Lower processing fees and concessional interest rates for women.'
        ],
        eligibility: [
            'Women micro-entrepreneurs, artisans, shopkeepers, and self-employed women.',
            'Must have a viable business proposal in manufacturing, trading, or service sector.',
            'Applicant should not be a defaulter to any financial institution.'
        ],
        documentsRequired: [
            'Identity Proof (Aadhaar / Voter ID / Driving License)',
            'Address Proof & Business Registration Certificate',
            'Quotation of machinery/equipment to be purchased',
            'Passbook photographs of applicant'
        ],
        applicationProcess: [
            'Apply online via JanSamarth portal or visit nearest bank / NBFC branch.',
            'Fill MUDRA loan application form specifying required slab (Shishu/Kishore/Tarun).',
            'Submit required business registration and identity documents.',
            'Verification and direct loan disbursement into applicant account.'
        ],
        applicationUrl: 'https://www.jansamarth.in/',
        officialWebsite: 'https://www.mudra.org.in/',
        targetAudience: ['Women entrepreneurs', 'Self-employed women', 'Low-income families'],
        tags: ['mudra', 'micro loan', 'women business', 'collateral free', 'msme'],
        featured: false,
        lastVerifiedAt: new Date('2026-01-25')
    },
    {
        name: 'STEP Scheme (Support to Training & Employment Programme)',
        shortDescription: 'Skill training and employability enhancement for women in traditional sectors like agriculture, handlooms, and handicrafts.',
        fullDescription: 'The STEP Scheme aims to provide competencies and skills that enable women to become self-employed entrepreneurs. The scheme covers traditional sectors including agriculture, horticulture, food processing, handlooms, tailoring, handicrafts, computer & IT services, and healthcare.',
        category: 'Skill Development',
        governmentLevel: 'Central',
        ministry: 'Ministry of Women and Child Development',
        state: 'All India',
        benefits: [
            'Free technical and vocational skill training programs.',
            'Stipend and learning toolkits provided to participants.',
            'Post-training placement assistance and entrepreneurship mentoring.',
            'Support for forming Self-Help Groups (SHGs) and cooperatives.'
        ],
        eligibility: [
            'Women aged 16 years and above across India.',
            'Priority given to marginalized, rural, and economically disadvantaged women.',
            'Women seeking self-employment or skill upgrade.'
        ],
        documentsRequired: [
            'Aadhaar Card or Identity Proof',
            'Age Proof Certificate',
            'Bank Account details for stipend transfer',
            'Income Certificate (if applicable)'
        ],
        applicationProcess: [
            'Contact local district WCD office or accredited STEP training provider.',
            'Submit application form along with identity and age credentials.',
            'Enroll in designated skill training batch.'
        ],
        applicationUrl: 'https://wcd.nic.in/schemes/support-training-and-employment-programme-women-step',
        officialWebsite: 'https://wcd.nic.in/',
        targetAudience: ['Working women', 'Job seekers', 'Low-income families'],
        tags: ['skills', 'vocational training', 'employment', 'handicrafts', 'empowerment'],
        featured: false,
        lastVerifiedAt: new Date('2026-01-10')
    },
    {
        name: 'Working Women Hostel Scheme (Sakhi Niwas)',
        shortDescription: 'Safe, affordable accommodation with daycare facilities for working women in urban and rural areas.',
        fullDescription: 'Sakhi Niwas (Working Women Hostel) scheme ensures safe and conveniently located accommodation for working women, along with daycare facilities for their children, in urban, semi-urban, and rural areas where employment opportunities for women exist.',
        category: 'Housing',
        governmentLevel: 'Central',
        ministry: 'Ministry of Women and Child Development',
        state: 'All India',
        benefits: [
            'Clean, safe, and subsidized lodging facilities.',
            'Daycare / Creche facility for toddlers and young children.',
            '24/7 security, CCTV surveillance, and resident warden.',
            'Flexible stay durations for single, widowed, divorced, or separated working women.'
        ],
        eligibility: [
            'Working women who are single, widowed, divorced, or married whose spouse resides elsewhere.',
            'Gross monthly income must not exceed prescribed urban/rural threshold limit.',
            'Women undergoing job training for up to 1 year.'
        ],
        documentsRequired: [
            'Employment Proof / Letter from Employer',
            'Income Certificate / Salary Slip',
            'Aadhaar Card and Identity Proof',
            'Passport photos of applicant and child (if utilizing creche)'
        ],
        applicationProcess: [
            'Contact the nearest Sakhi Niwas / Working Women Hostel administrator.',
            'Submit application form along with employment proof and salary slip.',
            'Room allotment following verification by hostel management committee.'
        ],
        applicationUrl: 'https://wcd.nic.in/schemes/working-women-hostel',
        officialWebsite: 'https://wcd.nic.in/',
        targetAudience: ['Working women', 'Job seekers'],
        tags: ['hostel', 'safe housing', 'working women', 'daycare', 'urban accommodation'],
        featured: true,
        lastVerifiedAt: new Date('2026-02-05')
    },
    {
        name: 'Pradhan Mantri Ujjwala Yojana (PMUY 2.0)',
        shortDescription: 'Deposit-free LPG gas connection and first refill for women from low-income households.',
        fullDescription: 'Pradhan Mantri Ujjwala Yojana (PMUY) 2.0 aims to safeguard the health of women and children by providing clean cooking fuel (LPG) to poor households. It includes a deposit-free LPG connection, first LPG refill, and hotplate free of cost.',
        category: 'Women Empowerment',
        governmentLevel: 'Central',
        ministry: 'Ministry of Petroleum and Natural Gas',
        state: 'All India',
        benefits: [
            'Deposit-free LPG connection valued at ₹1,600.',
            'First LPG cylinder refill and stove provided free of charge.',
            'Direct targeted subsidy on LPG cylinder refills.',
            'Eliminates indoor air pollution caused by wood/coal burning.'
        ],
        eligibility: [
            'Applicant must be an adult woman (aged 18+).',
            'Must belong to BPL / SEC household or SC/ST/PMAY beneficiary family.',
            'No existing LPG connection in any member’s name in the household.'
        ],
        documentsRequired: [
            'Aadhaar Card of Applicant and all adult family members',
            'Ration Card / BPL Certificate',
            'Bank Account Number and IFSC Code',
            'Self-declaration of address proof for migrant workers'
        ],
        applicationProcess: [
            'Apply online on PMUY portal (pmuy.gov.in) or visit nearest LPG distributor.',
            'Submit e-KYC documents and family Ration Card details.',
            'Distributor verifies documents and issues deposit-free connection.'
        ],
        applicationUrl: 'https://www.pmuy.gov.in/',
        officialWebsite: 'https://www.pmuy.gov.in/',
        targetAudience: ['Low-income families', 'Pregnant women', 'Farmers'],
        tags: ['lpg', 'clean energy', 'bpl support', 'women health', 'subsidized gas'],
        featured: false,
        lastVerifiedAt: new Date('2026-01-18')
    },
    {
        name: 'Beti Bachao Beti Padhao (BBBP)',
        shortDescription: 'National campaign and educational incentives to improve Child Sex Ratio and empower girl students.',
        fullDescription: 'Beti Bachao Beti Padhao (BBBP) addresses the declining Child Sex Ratio (CSR) and related issues of female empowerment over a life-cycle continuum. It fosters multi-sectoral action for girl child survival, protection, and secondary education retention.',
        category: 'Education',
        governmentLevel: 'Central',
        ministry: 'Ministry of Women and Child Development',
        state: 'All India',
        benefits: [
            'Scholarships and financial support for secondary and higher education of girls.',
            'School enrollment awareness drives and digital learning grants.',
            'Infrastructure support in government schools (separate girl toilets, safety pads).',
            'Community recognition for exemplary girl achievers.'
        ],
        eligibility: [
            'All girl children residing in India.',
            'Special incentive schemes targeted at school-going girls in government institutions.'
        ],
        documentsRequired: [
            'Birth Certificate of Girl Child',
            'Aadhaar Card of Child & Parents',
            'School Enrollment Certificate'
        ],
        applicationProcess: [
            'School-level registration during annual admissions.',
            'Contact District Collectorate or Women & Child Development Department for scholarship applications.'
        ],
        applicationUrl: 'https://wcd.nic.in/bbbp-schemes',
        officialWebsite: 'https://wcd.nic.in/',
        targetAudience: ['Girls', 'Students', 'Parents'],
        tags: ['education', 'girl child', 'scholarship', 'empowerment', 'schooling'],
        featured: true,
        lastVerifiedAt: new Date('2026-02-02')
    },
    {
        name: 'Centrally Sponsored Scheme for One Stop Centre (Sakhi Centre)',
        shortDescription: '24/7 integrated emergency support, medical aid, legal counsel, and psychological assistance for women facing violence.',
        fullDescription: 'One Stop Centres (OSC), popularly known as Sakhi Centres, provide integrated support and assistance to women affected by violence, both in private and public spaces, under one roof. Services include emergency response, medical aid, legal counselling, police assistance, and psycho-social support.',
        category: 'Safety',
        governmentLevel: 'Central',
        ministry: 'Ministry of Women and Child Development',
        state: 'All India',
        benefits: [
            '24/7 Toll-Free Helpline (Women Helpline 181) linked to Sakhi Centres.',
            'Immediate medical assistance and forensic documentation.',
            'Free legal counseling and police facilitation.',
            'Temporary shelter support up to 5 days for distress situations.'
        ],
        eligibility: [
            'Any woman or girl child facing violence, harassment, abuse, or distress regardless of age, caste, or income status.'
        ],
        documentsRequired: [
            'No mandatory documents required for immediate emergency assistance.'
        ],
        applicationProcess: [
            'Call Women Helpline 181 or visit nearest district Sakhi One Stop Centre directly.',
            'Walk-in emergency care available 24 hours a day, 7 days a week.'
        ],
        applicationUrl: 'https://wcd.nic.in/schemes/one-stop-centre-scheme-1',
        officialWebsite: 'https://wcd.nic.in/',
        targetAudience: ['Working women', 'Students', 'Pregnant women', 'Girls'],
        tags: ['safety', 'helpline 181', 'emergency support', 'legal assistance', 'sakhi centre'],
        featured: true,
        lastVerifiedAt: new Date('2026-02-08')
    },
    {
        name: 'Mahila Coir Yojana (Skill & Technology Upgrade)',
        shortDescription: 'Stipend-supported training and 75% subsidy on motorized coir spinning equipment for rural women workers.',
        fullDescription: 'Mahila Coir Yojana is a female-oriented self-employment scheme in the coir industry. It provides skill training in coir spinning along with a 75% financial subsidy on purchasing motorized ratts/coir processing equipment to boost rural women’s income.',
        category: 'Agriculture',
        governmentLevel: 'Central',
        ministry: 'Ministry of Micro, Small and Medium Enterprises',
        state: 'All India',
        benefits: [
            '75% government subsidy on motorized coir spinning equipment.',
            'Monthly stipend of ₹3,000 during 2-month skill training course.',
            'Guaranteed raw material supply and coir marketing network support.'
        ],
        eligibility: [
            'Rural women artisans and workers in coir-producing regions.',
            'Age 18 years and above.',
            'Only one woman per household eligible for equipment subsidy.'
        ],
        documentsRequired: [
            'Aadhaar Card and Caste Certificate',
            'Bank Passbook Copy',
            'Passport Size Photographs'
        ],
        applicationProcess: [
            'Submit application form to regional office of Coir Board or District Industries Centre (DIC).',
            'Complete 2-month coir spinning skill training to claim equipment subsidy.'
        ],
        applicationUrl: 'http://coirboard.gov.in/?page_id=256',
        officialWebsite: 'http://coirboard.gov.in/',
        targetAudience: ['Farmers', 'Low-income families', 'Women entrepreneurs'],
        tags: ['coir', 'rural income', 'agriculture', 'handicrafts', 'equipment subsidy'],
        featured: false,
        lastVerifiedAt: new Date('2026-01-14')
    },
    {
        name: 'Trade-Related Entrepreneurship Assistance & Development (TREAD)',
        shortDescription: 'Grant up to 30% of project cost for non-governmental organizations (NGOs) promoting female micro-entrepreneurs.',
        fullDescription: 'TREAD scheme addresses critical micro-credit needs of economically weaker women by providing financial grants up to 30% of total project cost to non-governmental organizations (NGOs) that train and lend credit to rural women self-help groups.',
        category: 'Financial Assistance',
        governmentLevel: 'Central',
        ministry: 'Ministry of Micro, Small and Medium Enterprises',
        state: 'All India',
        benefits: [
            'Government grant of up to 30% of project cost for NGO partner.',
            'Remaining 70% project cost financed via partner financial institutions.',
            'Capacity building and market linkage support for women micro-enterprises.'
        ],
        eligibility: [
            'Women self-help groups (SHGs) and registered non-profit organizations working for women empowerment.'
        ],
        documentsRequired: [
            'SHG Registration documents & Bank account details',
            'NGO Registration Certificate & Audited Financial Statements',
            'Detailed Project Report (DPR)'
        ],
        applicationProcess: [
            'NGO/SHG submits Project Proposal to MSME-Development Institute.',
            'Appraisal by Steering Committee followed by grant sanction.'
        ],
        applicationUrl: 'https://msme.gov.in/tread-scheme-women',
        officialWebsite: 'https://msme.gov.in/',
        targetAudience: ['Women entrepreneurs', 'Self-employed women', 'Low-income families'],
        tags: ['grant', 'tread', 'shg loan', 'micro credit', 'financial assistance'],
        featured: false,
        lastVerifiedAt: new Date('2026-01-22')
    },
    {
        name: 'Kanya Sumangala Yojana (State Specific Example)',
        shortDescription: 'Stage-wise conditional cash transfer of up to ₹15,000 for girl children from birth to higher education graduation.',
        fullDescription: 'Mukhyamantri Kanya Sumangala Yojana provides monetary assistance to families upon achieving key girl child milestones: birth, complete immunization, Grade 1 admission, Grade 6 admission, Grade 9 admission, and passing 10th/12th or entering degree programs.',
        category: 'Financial Assistance',
        governmentLevel: 'State',
        ministry: 'Department of Women & Child Development',
        state: 'Uttar Pradesh',
        benefits: [
            'Total financial assistance of ₹15,000 distributed across 6 key lifecycle stages.',
            'Direct Benefit Transfer (DBT) into bank account of girl child or mother.',
            'Incentivizes girl education retention and reduces female foeticide.'
        ],
        eligibility: [
            'Permanent resident of Uttar Pradesh.',
            'Annual family income must not exceed ₹3 Lakh.',
            'Maximum 2 girls per family eligible.'
        ],
        documentsRequired: [
            'UP Domicile / Residence Certificate',
            'Income Certificate (under ₹3 Lakh)',
            'Girl Child Birth Certificate & Vaccination Card',
            'Bank Account Passbook copy'
        ],
        applicationProcess: [
            'Apply online on MKSY Portal (mksy.up.gov.in).',
            'Select stage of application (e.g. Birth, Grade 1, Higher Education) and upload documents.',
            'Verification by District Block Development Officer (BDO).'
        ],
        applicationUrl: 'https://mksy.up.gov.in/',
        officialWebsite: 'https://mksy.up.gov.in/',
        targetAudience: ['Girls', 'Students', 'Parents'],
        tags: ['state scheme', 'kanya sumangala', 'dbt cash transfer', 'girl child', 'education assistance'],
        featured: true,
        lastVerifiedAt: new Date('2026-02-04')
    }
];
