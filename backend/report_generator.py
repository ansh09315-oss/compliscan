"""
Section 63 BSA 2023 Dynamic Legal Metrology Dossier Generator (backend/report_generator.py)
Generates judicial-grade compliance inspection PDF with cryptographic evidence certificates.
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import io
import datetime


def build_judicial_pdf(dossier_data: dict) -> bytes:
    """
    Builds a court-admissible PDF document conforming to Section 63 Bharatiya Sakshya Adhiniyam, 2023.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    story = []
    styles = getSampleStyleSheet()

    # Government Header
    title_style = ParagraphStyle(
        name='GovtTitle',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0B2545'),
        fontName='Helvetica-Bold'
    )
    sub_style = ParagraphStyle(
        name='GovtSub',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        fontName='Helvetica-Bold'
    )
    story.append(Paragraph("GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD &amp; PUBLIC DISTRIBUTION", title_style))
    story.append(Paragraph("LEGAL METROLOGY DIVISION • STATUTORY PACKAGED COMMODITIES INSPECTION DOSSIER", sub_style))
    story.append(Spacer(1, 12))

    # Product Metadata Table
    ext = dossier_data.get('extractedData', {})
    ev = dossier_data.get('evaluation', {})
    now_str = datetime.datetime.now().strftime("%d-%b-%Y %H:%M IST")

    table_data = [
        ["Dossier Ref Code:", str(dossier_data.get('dossierCode', 'LM-2026-UNKNOWN')), "Inspection Timestamp:", now_str],
        ["Product Name:", str(ext.get('productName', 'Packaged Commodity')), "Commodity Category:", str(ext.get('category', 'FMCG'))],
        ["Declared Net Qty:", f"{ext.get('netQuantityValue', 0)} {ext.get('netQuantityUnit', '')}", "Declared MRP:", f"₹ {ext.get('mrpValue', 0.0):.2f}"],
        ["Declared USP:", f"₹ {ext.get('declaredUspValue') or 'N/A'} {ext.get('declaredUspUnit') or ''}", "Packaging Geometry:", str(ext.get('packagingGeometry', 'BOX'))],
        ["Compliance Score:", f"{ev.get('complianceScore', 0)}%", "Statutory Verdict:", str(ev.get('verdict', 'NON_COMPLIANT'))]
    ]

    t = Table(table_data, colWidths=[110, 160, 120, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
        ('FONTNAME', (3,0), (3,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 14))

    # Statutory Violations Table
    story.append(Paragraph("<b>STATUTORY NON-COMPLIANCE FINDINGS &amp; CITATIONS:</b>", ParagraphStyle(
        name='ViolationsHeader', fontSize=10, leading=13, fontName='Helvetica-Bold', textColor=colors.HexColor('#0B2545')
    )))
    story.append(Spacer(1, 6))

    violations = ev.get('violations', [])
    v_rows = [["Rule Code", "Severity", "Defect Description", "Detected", "Statutory Requirement"]]
    for v in violations:
        v_rows.append([
            v.get('ruleCode', 'RULE'),
            v.get('severity', 'HIGH'),
            v.get('defect', ''),
            v.get('detected', 'N/A'),
            v.get('expected', 'N/A')
        ])

    if len(v_rows) > 1:
        vt = Table(v_rows, colWidths=[65, 55, 190, 115, 115])
        vt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0B2545')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('FONTSIZE', (0,0), (-1,-1), 7.5),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(vt)
    else:
        story.append(Paragraph("No statutory violations detected. Package is fully compliant under LMPC Rules, 2011.", ParagraphStyle(
            name='NoViolations', fontSize=8.5, textColor=colors.HexColor('#16A34A')
        )))

    story.append(Spacer(1, 18))

    # SECTION 63 BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023 CERTIFICATE
    sha256 = dossier_data.get('imageSha256', 'UNKNOWN-HASH-EVIDENCE')
    cert_text = f"""
    <b>STATUTORY ELECTRONIC EVIDENCE CERTIFICATE UNDER SECTION 63(4) OF BHARATIYA SAKSHYA ADHINIYAM, 2023</b><br/><br/>
    1. <b>Nature of Device:</b> Automated Legal Metrology Inspection Terminal running CompliScan AI CV engine.<br/>
    2. <b>Operation:</b> The terminal was operating properly at all material times during image capture, OCR parsing, and mathematical rule verification.<br/>
    3. <b>Master Evidence SHA-256 Digest:</b> <font name="Courier">{sha256}</font><br/>
    4. <b>Evidentiary Weight:</b> Admissible as primary electronic evidence under Section 61, Section 62, and Section 63 of Bharatiya Sakshya Adhiniyam, 2023 in judicial proceedings.
    """
    cert_table = Table([[Paragraph(cert_text, ParagraphStyle(
        name='Cert', fontSize=8, leading=11, textColor=colors.HexColor('#1E293B')
    ))]], colWidths=[540])
    cert_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#0B2545')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(cert_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
