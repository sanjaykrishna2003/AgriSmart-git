import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingAI from "../components/FloatingAI";
import { documentApi, schemeApi } from "../services/api";

import "../styles/schemes.css";

import {
  Search,
  FileCheck,
  Sparkles,
  IndianRupee,
  Banknote,
  Leaf,
  ArrowRight,
  ArrowLeft,
  Filter,
  CircleAlert,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

import { toggleApplySchemeAction, togglePossessedDocAction, setSchemes, setDocuments } from "../main";

export default function Schemes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.agri.user);
  const farms = useSelector((state) => state.agri.farms) || [];
  const crops = useSelector((state) => state.agri.crops) || [];
  const token = useSelector((state) => state.agri.token);
  const demoMode = useSelector((state) => state.agri.demoMode);
  
  const possessedDocs = useSelector((state) => state.agri.possessedDocs) || [];
  const appliedSchemeIds = useSelector((state) => state.agri.appliedSchemeIds) || [];
  const recommendedFromRedux = useSelector((state) => state.agri.schemes) || [];
  // Backend-uploaded documents (used to determine verified possession)
  const backendDocuments = useSelector((state) => state.agri.documents) || [];

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const checklistDocs = [
    "Aadhaar Card",
    "Bank Passbook",
    "Land Records",
    "Soil Health Card",
    "Sowing Certificate"
  ];

  const categories = [
    "All",
    "Financial Assistance",
    "Insurance",
    "Loans",
    "Subsidies"
  ];

  // Raw mock schemes list for offline calculations
  const rawMockSchemes = [
    {
      schemeId: 1,
      schemeName: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      category: 'Financial Assistance',
      description: 'Income support scheme providing financial benefit to all landholding farmer families across India to buy agriculture inputs.',
      benefits: '₹6,000 per year in 3 equal installments',
      eligibilityCriteria: 'All landholding farmer families with cultivable land in their name.',
      requiredDocuments: 'Aadhaar Card, Land Records, Bank Passbook',
      officialLink: 'https://pmkisan.gov.in',
      state: 'All States'
    },
    {
      schemeId: 2,
      schemeName: 'Kisan Credit Card (KCC)',
      category: 'Loans',
      description: 'Provides farmers with timely access to short-term credit loans for cultivation, crop production, and post-harvest maintenance expenses.',
      benefits: 'Short-term credit up to ₹3 Lakhs at low interest rate (4%)',
      eligibilityCriteria: 'All farmers, tenant farmers, and sharecroppers.',
      requiredDocuments: 'Aadhaar Card, Land Records, Bank Passbook',
      officialLink: 'https://pmkisan.gov.in/Documents/KCC.pdf',
      state: 'All States'
    },
    {
      schemeId: 3,
      schemeName: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
      category: 'Insurance',
      description: 'Crop insurance scheme offering financial security to farmers against crop failure or damages caused by natural disasters, pests, or disease.',
      benefits: 'Comprehensive crop insurance coverage with low premium (1.5% to 5%)',
      eligibilityCriteria: 'All farmers growing notified crops in notified areas.',
      requiredDocuments: 'Aadhaar Card, Sowing Certificate, Land Records, Bank Passbook',
      officialLink: 'https://pmfby.gov.in',
      state: 'All States'
    },
    {
      schemeId: 4,
      schemeName: 'Tamil Nadu Free Agricultural Power Scheme',
      category: 'Subsidies',
      description: 'State government initiative providing free agricultural electricity to farmers to operate pump sets for crop irrigation.',
      benefits: '100% free electricity supply for agricultural irrigation pumps',
      eligibilityCriteria: 'Tamil Nadu resident landholding farmers owning agricultural pump sets.',
      requiredDocuments: 'Aadhaar Card, Land Records',
      officialLink: 'https://www.tangedco.org',
      state: 'Tamil Nadu'
    },
    {
      schemeId: 5,
      schemeName: 'PM Kisan Maan-Dhan Yojana (PM-KMY)',
      category: 'Financial Assistance',
      description: 'A voluntary and contributory pension scheme for old age protection and social security of Small and Marginal Farmers (SMFs) owning cultivable land.',
      benefits: 'Minimum assured pension of ₹3,000 per month after reaching 60 years of age',
      eligibilityCriteria: 'Small and marginal farmers aged between 18 to 40 years with cultivable land up to 2 hectares.',
      requiredDocuments: 'Aadhaar Card, Bank Passbook',
      officialLink: 'https://pmkmy.gov.in',
      state: 'All States'
    },
    {
      schemeId: 6,
      schemeName: 'PMKSY - Per Drop More Crop (PDMC)',
      category: 'Subsidies',
      description: 'Focuses on water use efficiency at farm level through micro-irrigation technologies like drip and sprinkler irrigation systems.',
      benefits: 'Up to 55% subsidy for micro-irrigation installation',
      eligibilityCriteria: 'All landholding farmers with access to water sources.',
      requiredDocuments: 'Aadhaar Card, Land Records',
      officialLink: 'https://pmksy.gov.in',
      state: 'All States'
    },
    {
      schemeId: 7,
      schemeName: 'Paramparagat Krishi Vikas Yojana (PKVY)',
      category: 'Subsidies',
      description: 'Promotes organic farming through a cluster approach and PGS certification. Supports organic farming practices and marketing.',
      benefits: 'Financial assistance of ₹50,000 per hectare over 3 years',
      eligibilityCriteria: 'Farmers formed in clusters of 20 hectares (minimum 50 farmers).',
      requiredDocuments: 'Aadhaar Card, Land Records',
      officialLink: 'https://pgsindia-ncof.gov.in',
      state: 'All States'
    },
    {
      schemeId: 8,
      schemeName: 'Soil Health Card Scheme',
      category: 'Financial Assistance',
      description: 'Assists state governments to issue soil health cards to all farmers. Provides nutrient status of soil and recommendation of fertilizers.',
      benefits: 'Free soil testing and customized fertilizer recommendation card every 2 years',
      eligibilityCriteria: 'All farmers owning cultivable lands in India.',
      requiredDocuments: 'Aadhaar Card, Soil Health Card',
      officialLink: 'https://soilhealth.dac.gov.in',
      state: 'All States'
    },
    {
      schemeId: 9,
      schemeName: 'National Agriculture Market (e-NAM)',
      category: 'Financial Assistance',
      description: 'Pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.',
      benefits: 'Direct online selling of produce to buyers across India without middlemen',
      eligibilityCriteria: 'All individual farmers, FPOs, and traders.',
      requiredDocuments: 'Aadhaar Card, Bank Passbook',
      officialLink: 'https://enam.gov.in',
      state: 'All States'
    },
    {
      schemeId: 10,
      schemeName: 'SMAM (Sub-Mission on Agricultural Mechanization)',
      category: 'Subsidies',
      description: 'Promotes agricultural mechanization by providing subsidies for buying modern agricultural machinery like tractors, rotavators, power tillers.',
      benefits: '40% to 50% subsidy on purchase of verified agricultural machinery',
      eligibilityCriteria: 'All landholding farmers, special preference to women and SC/ST farmers.',
      requiredDocuments: 'Aadhaar Card, Land Records',
      officialLink: 'https://agrimachinery.nic.in',
      state: 'All States'
    },
    {
      schemeId: 11,
      schemeName: 'Punjab Free Power Scheme for Agriculture',
      category: 'Subsidies',
      description: 'State government initiative providing free electricity supply to agricultural tube wells to support irrigation for farmers in Punjab.',
      benefits: '100% free electricity supply for agricultural tubewells',
      eligibilityCriteria: 'Punjab resident landholding farmers owning agricultural electric pump tube wells.',
      requiredDocuments: 'Aadhaar Card, Land Records',
      officialLink: 'https://www.pspcl.in',
      state: 'Punjab'
    },
    {
      schemeId: 12,
      schemeName: 'Haryana Bhavantar Bharpayee Yojana (BBY)',
      category: 'Financial Assistance',
      description: 'State scheme compensating farmers for price deficit of horticultural crops (vegetables & fruits) when market prices fall below floor prices.',
      benefits: 'Price compensation difference deposited directly to bank accounts',
      eligibilityCriteria: 'Haryana resident farmers cultivating notified crops.',
      requiredDocuments: 'Aadhaar Card, Bank Passbook',
      officialLink: 'https://ekharid.haryana.gov.in',
      state: 'Haryana'
    }
  ];

  // Determine effective possessed docs:
  // If online and have backend docs, use VERIFIED ones.
  // Otherwise fall back to the manual checkbox list.
  const effectivePossessedDocs = useMemo(() => {
    if (!demoMode && backendDocuments.length > 0) {
      return backendDocuments
        .filter(d => d.verificationStatus === "VERIFIED")
        .map(d => d.documentType);
    }
    return possessedDocs;
  }, [backendDocuments, possessedDocs, demoMode]);

  // Fetch or calculate schemes recommendation
  const computedSchemesList = useMemo(() => {
    // If user exists and we have real recommended schemes from analytics-service in Redux
    if (!demoMode && recommendedFromRedux.length > 0) {
      return recommendedFromRedux.map((item) => {
        // Support both camelCase and snake_case keys from backend
        const schemeName = item.schemeName || item.scheme_name || "";
        const requiredDocsStr = item.requiredDocuments || item.required_documents || "";
        const reqDocs = requiredDocsStr ? requiredDocsStr.split(",").map(d => d.trim()).filter(Boolean) : [];
        const missing = reqDocs.filter(d =>
          !effectivePossessedDocs.some(
            pd => (pd || "").toLowerCase().includes((d || "").toLowerCase()) ||
                  (d || "").toLowerCase().includes((pd || "").toLowerCase())
          )
        );
        
        return {
          id: item.schemeId || item.scheme_id,
          name: schemeName,
          category: item.category || "Financial Assistance",
          match: item.eligibilityMatch || item.eligibility_match || 70,
          benefit: item.benefits || "Subsidies",
          description: item.description || "",
          missing: missing,
          benefits: item.benefits || "",
          eligibilityCriteria: item.eligibilityCriteria || item.eligibility_criteria || "",
          requiredDocuments: requiredDocsStr,
          officialLink: item.officialLink || item.official_link || "https://india.gov.in",
          state: item.state || "All States"
        };
      });
    }

    // Client-side simulation fallback
    const totalArea = farms.reduce((acc, f) => acc + (f.area || 0), 0);
    const hasActiveCrop = crops.some(c => c.status === "ACTIVE");
    const userState = user ? (user.state || "Tamil Nadu") : "Tamil Nadu";

    return rawMockSchemes.map((item) => {
      let score = 70;
      const criteria = item.eligibilityCriteria || "";
      if (item.state !== 'All States' && userState !== item.state) {
        score = 0;
      } else {
        if (item.state !== 'All States' && userState === item.state) score += 15;
        if (hasActiveCrop && criteria.toLowerCase().includes("crop")) score += 10;
        if (criteria.toLowerCase().includes("landholding") || criteria.toLowerCase().includes("acres")) {
          if (totalArea > 0 && totalArea <= 5.0) score += 5;
          else if (totalArea > 5.0) score -= 10;
        }
      }

      const reqDocs = (item.requiredDocuments || "").split(",").map(d => d.trim()).filter(Boolean);
      const missing = reqDocs.filter(d =>
        !effectivePossessedDocs.some(
          pd => (pd || "").toLowerCase().includes((d || "").toLowerCase()) ||
                (d || "").toLowerCase().includes((pd || "").toLowerCase())
        )
      );
      score -= missing.length * 8;

      return {
        id: item.schemeId,
        name: item.schemeName || "",
        category: item.category || "",
        match: Math.min(100, Math.max(0, score)),
        benefit: item.benefits || "",
        description: item.description || "",
        missing: missing,
        benefits: item.benefits || "",
        eligibilityCriteria: item.eligibilityCriteria || "",
        requiredDocuments: item.requiredDocuments || "",
        officialLink: item.officialLink || "https://india.gov.in",
        state: item.state || "All States"
      };
    }).filter(s => s.match > 0).sort((a, b) => b.match - a.match);
  }, [recommendedFromRedux, farms, crops, user, effectivePossessedDocs, demoMode]);

  // Sync recommended schemes if online
  useEffect(() => {
    if (!demoMode && token) {
      const syncSchemes = async () => {
        try {
          const data = await schemeApi.getRecommendedSchemes(token);
          if (data) dispatch(setSchemes(data));
        } catch (e) {
          console.warn("Schemes sync failed.");
        }
      };
      syncSchemes();

      // Also fetch backend documents to compute possession
      const syncDocuments = async () => {
        try {
          const docs = await documentApi.getMyDocuments(token);
          if (docs) dispatch(setDocuments(docs));
        } catch (e) {
          console.warn("Documents sync failed.");
        }
      };
      syncDocuments();
    }
  }, [token, demoMode]);

  const handleToggleDoc = (doc) => {
    dispatch(togglePossessedDocAction(doc));
    toast.info(`Updated possessed documents checklist.`);
  };

  const downloadDocumentTemplate = (docName) => {
    const content = `AGRISMART GOVERNMENT SCHEME DOCUMENT TEMPLATE\nDocument Type: ${docName}\n\nThis is an official document checklist template for ${docName}.\nPlease fill in your details and submit it to your regional agricultural office.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${docName.replace(/\s+/g, "_")}_template.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${docName} template!`);
  };

  const handleApplyScheme = async (schemeId, schemeName) => {
    const isApplied = appliedSchemeIds.includes(schemeId);
    if (demoMode) {
      dispatch(toggleApplySchemeAction(schemeId));
      if (isApplied) {
        toast.info(`Cancelled application for: ${schemeName}`);
      } else {
        toast.success(`Successfully applied for: ${schemeName}!`);
      }
      return;
    }
    try {
      const method = isApplied ? "DELETE" : "POST";
      const endpoint = isApplied ? "withdraw" : "apply";
      const res = await fetch(`http://localhost:8085/api/schemes/${endpoint}?schemeId=${schemeId}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        dispatch(toggleApplySchemeAction(schemeId));
        if (isApplied) {
          toast.info(`Cancelled application for: ${schemeName}`);
        } else {
          toast.success(`Successfully applied for: ${schemeName}!`);
        }
      } else {
        toast.error("Failed to update application status.");
      }
    } catch (e) {
      toast.error("Error connecting to schemes service.");
    }
  };

  // Filter schemes — FIXED: guard against undefined name/description
  const filteredSchemes = computedSchemesList.filter((scheme) => {
    const name = (scheme.name || "").toLowerCase();
    const desc = (scheme.description || "").toLowerCase();
    const searchLower = search.toLowerCase();
    const searchMatch = name.includes(searchLower) || desc.includes(searchLower);
    const categoryMatch = selectedCategory === "All" || scheme.category === selectedCategory;
    return searchMatch && categoryMatch;
  });

  const appliedSchemes = computedSchemesList.filter(s => appliedSchemeIds.includes(s.id));
  const recommendedSchemes = computedSchemesList.slice(0, 3); // show top 3 recommendations

  if (selectedScheme) {
    const isApplied = appliedSchemeIds.includes(selectedScheme.id);
    const reqDocs = selectedScheme.requiredDocuments 
      ? selectedScheme.requiredDocuments.split(",").map(d => d.trim())
      : ["Aadhaar Card"];

    return (
      <>
        <Navbar />
        <div className="govSchemesPage">
          <section className="govSchemesHero">
            <div>
              <h1>Scheme Details</h1>
              <p>Explore the full details and eligibility criteria for this government initiative.</p>
            </div>
          </section>

          <section style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
            <button 
              className="govOutlineBtn" 
              onClick={() => setSelectedScheme(null)}
              style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <ArrowLeft size={16} /> Back to Schemes
            </button>

            <div className="govRecommendationCard" style={{ padding: "30px", width: "100%", boxSizing: "border-box" }}>
              <div className="govRecommendationTop" style={{ marginBottom: "15px" }}>
                <span className="govSchemeCategory" style={{ fontSize: "14px" }}>{selectedScheme.category}</span>
                <span className="govMatchBadge" style={{ fontSize: "14px" }}>{selectedScheme.match}% Match</span>
              </div>

              <h2 style={{ fontSize: "28px", color: "var(--text-dark)", marginBottom: "15px" }}>{selectedScheme.name}</h2>
              
              <div style={{ margin: "20px 0" }}>
                <h4 style={{ fontSize: "16px", color: "var(--primary)", marginBottom: "8px" }}>Description</h4>
                <p style={{ color: "gray", fontSize: "14px", lineHeight: "1.6" }}>{selectedScheme.description}</p>
              </div>

              <div style={{ margin: "20px 0" }}>
                <h4 style={{ fontSize: "16px", color: "var(--primary)", marginBottom: "8px" }}>Benefits</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                  <IndianRupee size={20} style={{ color: "var(--primary)" }} />
                  <strong style={{ fontSize: "14px", color: "#334155" }}>{selectedScheme.benefits || selectedScheme.benefit}</strong>
                </div>
              </div>

              <div style={{ margin: "20px 0" }}>
                <h4 style={{ fontSize: "16px", color: "var(--primary)", marginBottom: "8px" }}>Eligibility Criteria</h4>
                <p style={{ color: "#334155", fontSize: "14px", lineHeight: "1.6", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  {selectedScheme.eligibilityCriteria}
                </p>
              </div>

              <div style={{ margin: "20px 0" }}>
                <h4 style={{ fontSize: "16px", color: "var(--primary)", marginBottom: "8px" }}>Required Documents Checklist</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  {reqDocs.map((doc, idx) => {
                    const hasDoc = possessedDocs.some(
                      pd => pd.toLowerCase().includes(doc.toLowerCase()) || doc.toLowerCase().includes(pd.toLowerCase())
                    );
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 15px", background: hasDoc ? "#f0fdf4" : "#fff1f2", borderRadius: "8px", border: `1px solid ${hasDoc ? "#bbf7d0" : "#fecdd3"}` }}>
                        <input 
                          type="checkbox" 
                          checked={hasDoc} 
                          readOnly 
                          style={{ accentColor: "var(--primary)" }} 
                        />
                        <span style={{ fontSize: "13.5px", fontWeight: "500", color: hasDoc ? "#166534" : "#991b1b" }}>
                          {doc} {hasDoc ? "(Possessed)" : "(Missing)"}
                        </span>
                        <button
                          onClick={() => downloadDocumentTemplate(doc)}
                          style={{
                            marginLeft: "auto",
                            background: "transparent",
                            color: "var(--primary)",
                            border: "1px solid var(--primary)",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          Download Template
                        </button>
                      </div>
                    );
                  })}
                </div>
                {selectedScheme.missing.length > 0 && (
                  <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "8px", color: "#b45309", fontSize: "12.5px" }}>
                    <CircleAlert size={18} />
                    <span>You are missing documents required for this scheme. Please upload or check them off in the documents checklist.</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
                <button
                  className="govPrimaryBtn"
                  onClick={() => handleApplyScheme(selectedScheme.id, selectedScheme.name)}
                  style={{
                    flex: 1,
                    background: isApplied ? "#ef4444" : "var(--primary)",
                    borderColor: isApplied ? "#ef4444" : "var(--primary)",
                    color: "white"
                  }}
                >
                  {isApplied ? "Cancel Application" : "Apply Now & Record"}
                </button>

                <button
                  className="govOutlineBtn"
                  onClick={() => window.open(selectedScheme.officialLink, "_blank")}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}
                >
                  Visit Official Portal <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
        <FloatingAI />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="govSchemesPage">
        {/* HERO */}
        <section className="govSchemesHero">
          <div>
            <h1>Government Schemes & Subsidies</h1>
            <p>Discover financial assistance, insurance, subsidies and support designed for your farm.</p>
          </div>
        </section>

        {/* SEARCH */}
        <section className="govSearchSection">
          <div className="govSchemeSearch">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search Government Schemes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        <section className="govSchemesLayout">
          {/* SIDEBAR */}
          <aside className="govSchemesSidebar">
            {/* Documents Sidebar — shows backend docs when online, checkboxes in demo mode */}
            <div className="govSidebarCard">
              <h3>
                <FileCheck size={20} />
                Documents Status
              </h3>
              {!demoMode && backendDocuments.length > 0 ? (
                <div className="govDocumentList">
                  {backendDocuments.map((doc) => (
                    <div
                      key={doc.documentId}
                      className="govDocumentItem"
                      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "default" }}
                    >
                      {doc.verificationStatus === "VERIFIED" ? (
                        <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
                      ) : doc.verificationStatus === "REJECTED" ? (
                        <XCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
                      ) : (
                        <Clock size={16} style={{ color: "#f59e0b", flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 13, flex: 1 }}>{doc.documentType}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10,
                        background: doc.verificationStatus === "VERIFIED" ? "#dcfce7" : doc.verificationStatus === "REJECTED" ? "#fee2e2" : "#fef3c7",
                        color: doc.verificationStatus === "VERIFIED" ? "#15803d" : doc.verificationStatus === "REJECTED" ? "#dc2626" : "#b45309"
                      }}>
                        {doc.verificationStatus}
                      </span>
                    </div>
                  ))}
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                    Only <strong>Verified</strong> documents count toward eligibility.
                    <span
                      style={{ color: "var(--primary)", cursor: "pointer", marginLeft: 4 }}
                      onClick={() => navigate("/profile")}
                    >
                      Upload more →
                    </span>
                  </p>
                </div>
              ) : (
                <div className="govDocumentList">
                  {checklistDocs.map((doc) => (
                    <label key={doc} className="govDocumentItem">
                      <input
                        type="checkbox"
                        checked={possessedDocs.includes(doc)}
                        onChange={() => handleToggleDoc(doc)}
                      />
                      <span>{doc}</span>
                    </label>
                  ))}
                  {!demoMode && (
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                      <span
                        style={{ color: "var(--primary)", cursor: "pointer" }}
                        onClick={() => navigate("/profile")}
                      >
                        Upload real documents →
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="govSidebarCard">
              <h3>
                <Filter size={20} />
                Categories
              </h3>
              <div className="govCategoryList">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={selectedCategory === category ? "govCategoryBtn active" : "govCategoryBtn"}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <div className="govSchemesMain">
            {/* My Applied Schemes */}
            <section className="govAppliedSection">
              <div className="govSectionHeader">
                <h2>My Applied Schemes</h2>
                <span>{appliedSchemes.length} Applications</span>
              </div>

              {appliedSchemes.length > 0 ? (
                appliedSchemes.map((scheme) => (
                  <div className="govAppliedCard" key={scheme.id}>
                    <div className="govAppliedLeft">
                      <div className="govSchemeIcon">
                        <Banknote size={28} />
                      </div>
                      <div>
                        <span className="govSchemeCategory">{scheme.category}</span>
                        <h3>{scheme.name}</h3>
                        <p>{scheme.description}</p>
                      </div>
                    </div>

                    <div className="govAppliedRight">
                      <span className="govStatusBadge approved">Applied</span>
                      <button className="govOutlineBtn" onClick={() => handleApplyScheme(scheme.id, scheme.name)}>
                        Cancel Application
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "12px", color: "gray", fontSize: "13px", textAlign: "center" }}>
                  You have not applied for any schemes yet. Apply for recommended schemes below.
                </div>
              )}
            </section>

            {/* AI RECOMMENDED SCHEMES */}
            <section className="govRecommendationSection">
              <div className="govSectionHeader">
                <h2>
                  <Sparkles size={20} />
                  AI Recommended Schemes
                </h2>
                <span>Personalized For Your Farm</span>
              </div>

              <div className="govRecommendationGrid">
                {recommendedSchemes.map((scheme) => (
                  <div key={scheme.id} className="govRecommendationCard">
                    <div className="govRecommendationTop">
                      <span className="govSchemeCategory">{scheme.category}</span>
                      <span className="govMatchBadge">{scheme.match}% Match</span>
                    </div>

                    <h3>{scheme.name}</h3>
                    <p>{scheme.description}</p>

                    <div className="govBenefitRow">
                      <IndianRupee size={18} />
                      <span>{scheme.benefit}</span>
                    </div>

                    <div className="govMissingDocs">
                      <h4>Missing Documents</h4>
                      {scheme.missing.length > 0 ? (
                        scheme.missing.map((doc, index) => (
                          <div key={index} className="govMissingItem">
                            <CircleAlert size={16} />
                            <span>{doc}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "12px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "5px" }}>
                          ✔ All documents available!
                        </div>
                      )}
                    </div>

                    <button
                      className="govPrimaryBtn"
                      onClick={() => setSelectedScheme(scheme)}
                      style={{
                        background: appliedSchemeIds.includes(scheme.id) ? "#16a34a" : "",
                        borderColor: appliedSchemeIds.includes(scheme.id) ? "#16a34a" : ""
                      }}
                    >
                      {appliedSchemeIds.includes(scheme.id) ? "View Application" : "Apply Now"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* ALL GOVERNMENT SCHEMES */}
            <section className="govAllSchemes">
              <div className="govSectionHeader">
                <h2>Browse Government Schemes</h2>
                <span>{filteredSchemes.length} Results</span>
              </div>

              <div className="govSchemeGrid">
                {filteredSchemes.map((scheme) => (
                  <div key={scheme.id} className="govSchemeCard">
                    <div className="govSchemeCardTop">
                      <div className="govSchemeIcon">
                        <Leaf size={24} />
                      </div>
                      <span className="govMatchBadge">{scheme.match}%</span>
                    </div>

                    <span className="govSchemeCategory">{scheme.category}</span>
                    <h3>{scheme.name}</h3>
                    <p>{scheme.description}</p>

                    <div className="govBenefitRow">
                      <IndianRupee size={18} />
                      <span>{scheme.benefit}</span>
                    </div>

                    <div className="govSchemeButtons">
                      <button
                        className="govPrimaryBtn"
                        onClick={() => setSelectedScheme(scheme)}
                        style={{
                          background: appliedSchemeIds.includes(scheme.id) ? "#16a34a" : "",
                          borderColor: appliedSchemeIds.includes(scheme.id) ? "#16a34a" : ""
                        }}
                      >
                        {appliedSchemeIds.includes(scheme.id) ? "View / Cancel" : "Apply Now"}
                      </button>
                      <button
                        className="govOutlineBtn"
                        onClick={() => window.open(scheme.officialLink || "https://india.gov.in", "_blank")}
                      >
                        Official Website
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      <FloatingAI />
      <Footer />
    </>
  );
}