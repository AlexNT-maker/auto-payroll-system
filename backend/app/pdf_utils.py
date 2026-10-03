from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
from io import BytesIO

def register_greek_font():
    try:
        font_path = "C:\\Windows\\Fonts\\arial.ttf"
        
        if not os.path.exists(font_path):
             font_path = "C:\\Users\\alexn\\OneDrive\\Desktop\\ARIAL.TTF"

        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('Arial', font_path))
            return 'Arial'
        else:
            return 'Helvetica' 
    except:
        return 'Helvetica'

def generate_payroll_pdf(payroll_data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4))
    elements = []
    
    font_name = register_greek_font()   
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontName=font_name,
        fontSize=18,
        alignment=1, 
        spaceAfter=20
    )
    
    start = payroll_data["start_date"]
    end = payroll_data["end_date"]
    title_text = f"Μισθοδοσία: {start} έως {end}"
    elements.append(Paragraph(title_text, title_style))
    
    data = [[
        "Εργαζόμενος", "Ημέρες", "Μισθός","Ώρες Υπ.", "Υπερωρία", 
        "Extra", "Αιτιολογία", 
        "Σύνολο", "Τράπεζα", "Μετρητά"
    ]]
    
    total_bank = 0
    total_cash = 0
    total_grand = 0
    total_extra_sum = 0

    for item in payroll_data["payments"]:
        row = [
            item["employee_name"],
            str(item["days_worked"]),
            f"{item['total_wage']:.2f}",
            f"{item['total_overtime_hours']:.1f}",
            f"{item['total_overtime']:.2f}",
            f"{item['total_extra']:.2f}",    
            item['extra_reasons'],
            f"{item['grand_total']:.2f}",
            f"{item['bank_pay']:.2f}",
            f"{item['cash_pay']:.2f}"
        ]
        data.append(row)
        
        total_bank += item['bank_pay']
        total_cash += item['cash_pay']
        total_grand += item['grand_total']
        total_extra_sum += item['total_extra']

    data.append([
        "ΓΕΝΙΚΟ ΣΥΝΟΛΟ", "", "", "", 
        f"{total_extra_sum:.2f}", "", 
        f"{total_grand:.2f}", f"{total_bank:.2f}", f"{total_cash:.2f}"
    ])

    table = Table(data)
    
    style = TableStyle([
        ('FONT', (0, 0), (-1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#05407a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'), 
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#b0b8c4')),
        
        ('BACKGROUND', (7, 0), (7, -1), colors.aliceblue), 
        ('BACKGROUND', (8, 0), (8, -1), colors.lightyellow), 
        ('FONTNAME', (0, -1), (-1, -1), f'{font_name}-Bold' if font_name=='Arial' else font_name),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
    ])
    
    try:
        pdfmetrics.registerFont(TTFont('Arial-Bold', "C:\\Windows\\Fonts\\arialbd.ttf"))
        style.add('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold') 
        style.add('FONTNAME', (0, -1), (-1, -1), 'Arial-Bold') 
    except:
        pass

    table.setStyle(style)
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)
    return buffer

def generate_boat_analysis_pdf(data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    font_name = register_greek_font()   
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=font_name, alignment=1)
    
    elements.append(Paragraph(f"Ανάλυση Σκάφους: {data['boat_name']}", title_style))
    elements.append(Spacer(1, 20))
    
    table_data = [["Ημερομηνία", "Εργαζόμενος", "Μισθός", "Υπερωρία", "Σύνολο"]]
    
    for item in data["analysis_data"]:
        table_data.append([
            str(item["date"]), 
            item["employee_name"],
            f"{item['daily_cost']:.2f}",
            f"{item['overtime_cost']:.2f}",
            f"{item['total_cost']:.2f}"
        ])
        
    table_data.append(["ΓΕΝΙΚΟ ΣΥΝΟΛΟ", "", "", "", f"{data['total_cost']:.2f}"])
    
    table = Table(table_data)
    style = TableStyle([
        ('FONT', (0, 0), (-1, -1), font_name),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#05407a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#b0b8c4')),
        ('FONTNAME', (0, -1), (-1, -1), f'{font_name}-Bold' if font_name=='Arial' else font_name),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
    ])
    try:
        pdfmetrics.registerFont(TTFont('Arial-Bold', "C:\\Windows\\Fonts\\arialbd.ttf"))
        style.add('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold') 
        style.add('FONTNAME', (0, -1), (-1, -1), 'Arial-Bold') 
    except: pass

    table.setStyle(style)
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_short_boat_analysis_pdf(data, is_captain=False):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    font_name = register_greek_font()   
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=font_name, alignment=1)
    
    title_text = f"Συνοπτική Αναφορά Καπετάνιου: {data['boat_name']}" if is_captain else f"Συνοπτική Ανάλυση: {data['boat_name']}"
    elements.append(Paragraph(title_text, title_style))
    elements.append(Paragraph(f"Διάστημα: {data['start_date']} έως {data['end_date']}", ParagraphStyle('Sub', fontName=font_name, alignment=1)))
    elements.append(Spacer(1, 20))
    
    if is_captain:
        table_data = [["Εργαζόμενος", "Μεροκάματα", "Ώρες Υπερ."]]
        total_days = 0.0
        total_hours = 0.0
        
        for emp in data["employees"]:
            table_data.append([
                emp["name"],
                str(emp["days"]),
                f"{emp['ot_hours']:.1f}"
            ])
            total_days += emp["days"]
            total_hours += emp["ot_hours"]
            
        table_data.append(["ΓΕΝΙΚΟ ΣΥΝΟΛΟ", str(total_days), f"{total_hours:.1f}"])
    else:
        table_data = [["Εργαζόμενος", "Μεροκάματα", "Ώρες Υπερ.", "Συνολικό Κόστος"]]
        
        for emp in data["employees"]:
            table_data.append([
                emp["name"],
                str(emp["days"]),
                f"{emp['ot_hours']:.1f}",
                f"{emp['cost']:.2f} €"
            ])
            
        table_data.append(["ΓΕΝΙΚΟ ΣΥΝΟΛΟ", "", "", f"{data['total_cost']:.2f} €"])
    
    table = Table(table_data)
    style = TableStyle([
        ('FONT', (0, 0), (-1, -1), font_name),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#05407a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#b0b8c4')),
        ('FONTNAME', (0, -1), (-1, -1), f'{font_name}-Bold' if font_name=='Arial' else font_name),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
    ])
    try:
        pdfmetrics.registerFont(TTFont('Arial-Bold', "C:\\Windows\\Fonts\\arialbd.ttf"))
        style.add('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold') 
        style.add('FONTNAME', (0, -1), (-1, -1), 'Arial-Bold') 
    except: pass

    table.setStyle(style)
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer


def _base_table_style(font_name):
    style = TableStyle([
        ('FONT', (0, 0), (-1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#05407a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#b0b8c4')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2),
            [colors.white, colors.HexColor('#f0f4fa')]),
    ])
    try:
        pdfmetrics.registerFont(TTFont('Arial-Bold', "C:\\Windows\\Fonts\\arialbd.ttf"))
        style.add('FONTNAME', (0, 0), (-1, 0), 'Arial-Bold')
        style.add('FONTNAME', (0, -1), (-1, -1), 'Arial-Bold')
    except Exception:
        pass
    return style


def generate_material_usage_pdf(data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []

    font_name = register_greek_font()
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=font_name, alignment=1)
    sub_style = ParagraphStyle('Sub', fontName=font_name, alignment=1, fontSize=10, textColor=colors.grey, spaceAfter=12)
    filter_style = ParagraphStyle('Filter', fontName=font_name, alignment=1, fontSize=9, textColor=colors.HexColor('#05407a'))

    elements.append(Paragraph("Ανάλυση Κατανάλωσης Υλικών", title_style))
    elements.append(Paragraph(f"Διάστημα: {data['start']} έως {data['end']}", sub_style))
    if data.get("filter_text"):
        elements.append(Paragraph(f"Φίλτρα: {data['filter_text']}", filter_style))
    elements.append(Spacer(1, 16))

    table_data = [["Υλικό", "Μονάδα", "Κατηγορία", "Ποσότητα", "Παραχωρήθηκε", "Σύνολο"]]

    for item in data["items"]:
        table_data.append([
            item["material_name"],
            item["unit"],
            item["category"],
            f"{item['quantity']:g}",
            item["boat_name"],
            f"{item['total']:.2f} €",
        ])

    table_data.append(["ΓΕΝΙΚΟ ΣΥΝΟΛΟ", "", "", "", "", f"{data['total']:.2f} €"])

    table = Table(table_data, colWidths=[110, 55, 95, 60, 95, 80])
    table.setStyle(_base_table_style(font_name))
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)
    return buffer


def generate_invoice_analysis_pdf(data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []

    font_name = register_greek_font()
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=font_name, alignment=1)
    sub_style = ParagraphStyle('Sub', fontName=font_name, alignment=1, fontSize=10, textColor=colors.grey, spaceAfter=12)
    filter_style = ParagraphStyle('Filter', fontName=font_name, alignment=1, fontSize=9, textColor=colors.HexColor('#05407a'))

    elements.append(Paragraph("Ανάλυση Τιμολογίων", title_style))
    elements.append(Paragraph(f"Διάστημα: {data['start']} έως {data['end']}", sub_style))
    if data.get("filter_text"):
        elements.append(Paragraph(f"Φίλτρα: {data['filter_text']}", filter_style))
    elements.append(Spacer(1, 16))

    table_data = [["Προμηθευτής", "Χρεώνεται σε", "Σύνολο", "Πλήθος"]]

    for item in data["items"]:
        table_data.append([
            item["supplier_name"],
            item["boat_name"],
            f"{item['total']:.2f} €",
            str(item["count"]),
        ])

    table_data.append(["ΓΕΝΙΚΟ ΣΥΝΟΛΟ", "", f"{data['total']:.2f} €", ""])

    table = Table(table_data, colWidths=[180, 140, 100, 75])
    table.setStyle(_base_table_style(font_name))
    elements.append(table)

    doc.build(elements)
    buffer.seek(0)
    return buffer

# -- Full Boat Report --

LOGO_PATH = r"C:\Users\alexn\OneDrive\Desktop\auto-payroll-system\frontend\src\icon\logo.png"


LOGO_PATH = r"C:\Users\alexn\OneDrive\Desktop\auto-payroll-system\frontend\src\icon\logo.png"


def _load_logo_flowable(width: float = 180):
    """Load the logo image for PDF reports."""
    try:
        if not os.path.exists(LOGO_PATH):
            print(f"[logo] Δεν βρέθηκε: {LOGO_PATH}")
            return None

        img_reader = ImageReader(LOGO_PATH)
        iw, ih = img_reader.getSize()

        if iw <= 0 or ih <= 0:
            print(f"[logo] Μη έγκυρες διαστάσεις: {iw}x{ih}")
            return None

        ratio = ih / iw
        height = width * ratio

        logo = Image(LOGO_PATH, width=width, height=height)
        logo.hAlign = 'CENTER'
        return logo

    except Exception:
        import traceback
        traceback.print_exc()
        return None


def generate_full_boat_report_pdf(data):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=45, rightMargin=45,
        topMargin=35, bottomMargin=35,
    )
    elements = []
    font_name = register_greek_font()
    styles = getSampleStyleSheet()

    # ---------- LOGO ----------
    logo = _load_logo_flowable(180)
    if logo:
        elements.append(logo)
        elements.append(Spacer(1, 12))

    # ---------- TITLE ----------
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontName=font_name,
        alignment=1,
        fontSize=15,
        spaceAfter=4,
    )
    sub_style = ParagraphStyle(
        'Sub',
        fontName=font_name,
        alignment=1,
        fontSize=9,
        textColor=colors.grey,
    )
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontName=font_name,
        alignment=1,
        fontSize=12,
        spaceBefore=8,
        spaceAfter=8,
    )

    elements.append(Paragraph(
        f"{data['boat_name']} ΣΥΝΟΠΤΙΚΗ ΑΝΑΛΥΣΗ ΕΡΓΑΣΙΩΝ",
        title_style
    ))
    elements.append(Paragraph(
        f"Διάστημα: {data['start_date']} έως {data['end_date']}",
        sub_style
    ))
    elements.append(Spacer(1, 18))

    elements.append(Paragraph("ΠΡΟΣΩΠΙΚΟ", section_style))

    p_data = [["Εργαζόμενος", "Μεροκάματα", "Ώρες Υπ."]]
    for p in data["personnel"]:
        p_data.append([p["name"], str(p["days"]), str(p["ot_hours"])])
    p_data.append(["ΣΥΝΟΛΟ", str(data["total_days"]), str(data["total_ot_hours"])])

    t1 = Table(p_data, colWidths=[290, 105, 100])
    t1.setStyle(_base_table_style(font_name))
    elements.append(t1)
    elements.append(Spacer(1, 22))

    elements.append(Paragraph("ΥΛΙΚΑ ΣΥΝΟΛΙΚΟ ΚΟΣΤΟΣ", section_style))

    m_data = [["Υλικά", "Ποσότητα", "Κόστος", "Σύνολο"]]
    if data["materials"]:
        for m in data["materials"]:
            m_data.append([
                m["name"],
                f"{m['quantity']:g}",
                f"{m['unit_price']:.2f}",
                f"{m['total']:.2f}",
            ])
    else:
        m_data.append(["—", "", "", "0.00"])
    m_data.append(["ΣΥΝΟΛΟ", "", "", f"{data['materials_total']:.2f}"])

    t2 = Table(m_data, colWidths=[275, 70, 70, 80])
    t2.setStyle(_base_table_style(font_name))
    elements.append(t2)
    elements.append(Spacer(1, 22))

    # ---------- ΠΡΟΜΗΘΕΥΤΕΣ ----------
    if data["suppliers"]:
        elements.append(Paragraph("ΕΞΟΔΑ ΠΡΟΜΗΘΕΥΤΗ", section_style))

        s_data = [["Προμηθευτής", "Τιμολόγια", "Σύνολο"]]
        for s in data["suppliers"]:
            s_data.append([s["name"], str(s["count"]), f"{s['amount']:.2f}"])
        s_data.append(["ΣΥΝΟΛΟ", "", f"{data['suppliers_total']:.2f}"])

        t3 = Table(s_data, colWidths=[280, 100, 115])
        t3.setStyle(_base_table_style(font_name))
        elements.append(t3)
        elements.append(Spacer(1, 22))

    # ---------- GRAND TOTAL ----------
    total_style = ParagraphStyle(
        'GrandTotal',
        parent=styles['Heading2'],
        fontName=font_name,
        alignment=2,
        fontSize=13,
        textColor=colors.HexColor('#05407a'),
    )
    grand = data["materials_total"] + data["suppliers_total"]
    elements.append(Paragraph(f"ΓΕΝΙΚΟ ΣΥΝΟΛΟ: {grand:.2f} €", total_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer