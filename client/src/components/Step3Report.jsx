import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function Step3Report({ report }) {
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }
  const navigate = useNavigate()
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 25;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, { align: "center" });
    currentY += 5;
    doc.setDrawColor(34, 197, 94);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
    currentY += 15;

    // Final Score Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 12, { align: "center" });
    currentY += 30;

    // Skill Scores
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");
    doc.setFontSize(12);
    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);
    currentY += 40;

    // ================= NEW: NON-VERBAL & ADVANCED METRICS SECTION =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Non-Verbal & Communication Analysis", margin, currentY);
    currentY += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Eye Contact: ${report.nonVerbalMetrics?.eyeContact || 0}%`, margin + 5, currentY);
    doc.text(`Smile Score: ${report.nonVerbalMetrics?.smileScore || 0}%`, margin + 60, currentY);
    doc.text(`Pace: ${report.paceAnalysis?.wpm || 0} WPM (${report.paceAnalysis?.assessment || "Normal"})`, margin + 115, currentY);
    
    currentY += 8;
    doc.text(`STAR Method Score: ${report.starAnalysis?.score || 0}%`, margin + 5, currentY);
    doc.text(`Attention Score: ${report.nonVerbalMetrics?.attentionScore || 0}%`, margin + 60, currentY);
    
    currentY += 8;
    const fillers = Object.entries(report.fillerAnalysis?.counts || {})
      .map(([w, c]) => `${w}: ${c}`).join(", ");
    doc.text(`Filler Words (${report.fillerAnalysis?.total || 0}): ${fillers || "None detected"}`, margin + 5, currentY);
    currentY += 15;

    // Professional Advice
    let advice = finalScore >= 8 ? "Excellent performance. You demonstrate high clarity and professional confidence." : finalScore >= 5 ? "Good foundation. Focus on reducing filler words and refining your technical articulation." : "Significant improvement required. Work on body language and structured answering.";
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);
    doc.roundedRect(margin, currentY, contentWidth, 25, 2, 2);
    doc.setFont("helvetica", "bold");
    doc.text("Professional Advice", margin + 5, currentY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 15);
    doc.text(splitAdvice, margin + 5, currentY + 16);
    currentY += 35;

    // Question Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Question", "Score", "Feedback"]],
      body: questionWiseScore.map((q, i) => [`${i + 1}`, q.question, `${q.score}/10`, q.feedback]),
      styles: { fontSize: 9, cellPadding: 5, valign: "top" },
      headStyles: { fillColor: [34, 197, 94], textColor: 255, halign: "center" },
      columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { cellWidth: 55 }, 2: { cellWidth: 20, halign: "center" } },
    });

    doc.save(`Interview_Report_${report.userName || "User"}.pdf`);
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8'>
      {/* Header Section */}
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='md:mb-10 w-full flex items-start gap-4 flex-wrap'>
          <button
            onClick={() => navigate("/history")}
            className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
            <FaArrowLeft className='text-gray-600' />
          </button>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>Interview Analytics Dashboard</h1>
            <p className='text-gray-500 mt-2'>AI-powered performance insights</p>
          </div>
        </div>
        <button onClick={downloadPDF} className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md transition-all font-semibold text-sm sm:text-base'>
          Download PDF
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
        {/* LEFT COLUMN */}
        <div className='space-y-6'>
          {/* Overall Performance */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h3 className="text-gray-500 mb-4 text-sm">Overall Performance</h3>
            <div className='relative w-20 h-20 mx-auto'>
              <CircularProgressbar value={percentage} text={`${score}/10`} styles={buildStyles({ textSize: "18px", pathColor: "#10b981", textColor: "#ef4444", trailColor: "#e5e7eb" })} />
            </div>
            <p className="text-gray-400 mt-3 text-xs">Out of 10</p>
            <div className="mt-4">
              <p className="font-semibold text-gray-800 text-sm">{performanceText}</p>
              <p className="text-gray-500 text-xs mt-1">{shortTagline}</p>
            </div>
          </motion.div>

          {/* Skill Evaluation */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-white rounded-2xl shadow-lg p-6'>
            <h3 className="text-base font-semibold text-gray-700 mb-6">Skill Evaluation</h3>
            <div className='space-y-5'>
              {skills.map((s, i) => (
                <div key={i}>
                  <div className='flex justify-between mb-2 text-sm'>
                    <span>{s.label}</span>
                    <span className='font-semibold text-green-600'>{s.value}</span>
                  </div>
                  <div className='bg-gray-200 h-2 rounded-full'>
                    <div className='bg-green-500 h-full rounded-full' style={{ width: `${s.value * 10}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Non-Verbal Metrics Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-bold text-gray-700 mb-4">📹 Non-Verbal Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">👁️ Eye Contact:</span>
                <span className="font-bold text-emerald-600">{report.nonVerbalMetrics?.eyeContact || 0}%</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-gray-500">😊 Smile:</span>
                <span className="font-bold text-emerald-600">{report.nonVerbalMetrics?.smileScore || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">🎯 Attention:</span>
                <span className="font-bold text-emerald-600">{report.nonVerbalMetrics?.attentionScore || 0}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Filler, STAR, and Pace Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <h3 className="font-bold text-gray-700 mb-2 text-sm">🗣️ Filler Words ({report.fillerAnalysis?.total || 0})</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.fillerAnalysis?.counts || {}).map(([w, c]) => (
                  <span key={w} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium">{w}: {c}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                <h3 className="font-bold text-gray-700 mb-1 text-xs uppercase">⭐ STAR Score</h3>
                <p className="text-2xl font-black text-emerald-600">{report.starAnalysis?.score || 0}%</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
                <h3 className="font-bold text-gray-700 mb-1 text-xs uppercase">⏱️ Pace</h3>
                <p className="text-xl font-bold text-gray-800 leading-none">{report.paceAnalysis?.wpm || 0}</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">{report.paceAnalysis?.assessment || "Normal"}</p>
              </div>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-white rounded-2xl shadow-lg p-5'>
            <h3 className="text-base font-semibold text-gray-700 mb-4">Performance Trend</h3>
            <div className='h-64'>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#22c55e" fill="#bbf7d0" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Question Breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='bg-white rounded-2xl shadow-lg p-5'>
            <h3 className="text-base font-semibold text-gray-700 mb-6">Question Breakdown</h3>
            <div className='space-y-6'>
              {questionWiseScore.map((q, i) => (
                <div key={i} className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
                    <div>
                      <p className="text-xs text-gray-400">Question {i + 1}</p>
                      <p className="font-semibold text-gray-800 text-sm leading-relaxed">{q.question || "Question not available"}</p>
                    </div>
                    <div className='bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold text-xs shrink-0'>{q.score ?? 0}/10</div>
                  </div>
                  <div className='bg-green-50 border border-green-200 p-4 rounded-lg'>
                    <p className='text-xs text-green-600 font-semibold mb-1'>AI Feedback</p>
                    <p className='text-sm text-gray-700 leading-relaxed'>{q.feedback || "No feedback available."}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Step3Report;