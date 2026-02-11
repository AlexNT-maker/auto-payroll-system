# backend/app/pdf_utils.py

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
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
        "Εργαζόμενος", "Ημέρες", "Μισθός (€)", "Υπερωρία (€)", 
        "Σύνολο (€)", "Τράπεζα (€)", "Μετρητά (€)"
    ]]
    
    total_bank = 0
    total_cash = 0
    total_grand = 0

    for item in payroll_data["payments"]:
        row = [
            item["employee_name"],
            str(item["days_worked"]),
            f"{item['total_wage']:.2f}",
            f"{item['total_overtime']:.2f}",
            f"{item['grand_total']:.2f}",
            f"{item['bank_pay']:.2f}",
            f"{item['cash_pay']:.2f}"
        ]
        data.append(row)
        
        total_bank += item['bank_pay']
        total_cash += item['cash_pay']
        total_grand += item['grand_total']

    data.append([
        "ΓΕΝΙΚΟ ΣΥΝΟΛΟ", "", "", "", 
        f"{total_grand:.2f}", f"{total_bank:.2f}", f"{total_cash:.2f}"
    ])

    table = Table(data)
    
    style = TableStyle([
        ('FONT', (0, 0), (-1, -1), font_name),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, 0), colors.gray),      
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'), 
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        
        ('BACKGROUND', (5, 0), (5, -1), colors.aliceblue), 
        ('BACKGROUND', (6, 0), (6, -1), colors.lightyellow), 
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