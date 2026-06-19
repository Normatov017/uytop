import io
from collections import defaultdict
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from sqlalchemy import func, select

from app.core.deps import CurrentUser, DbSession
from app.models.enums import PropertyStatus
from app.models.property import Property

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/property-sales")
def property_sales_report(db: DbSession, current_user: CurrentUser):
    properties = list(db.scalars(
        select(Property).where(Property.owner_id == current_user.id).order_by(Property.created_at.desc())
    ).all())

    total_properties = len(properties)
    if total_properties == 0:
        raise HTTPException(status_code=404, detail="No properties found for this user")

    prices = [p.price for p in properties if p.price]
    avg_price = float(sum(prices)) / len(prices) if prices else 0
    total_views = sum(p.views_count for p in properties)
    total_phone_clicks = sum(p.phone_clicks for p in properties)

    monthly = defaultdict(lambda: {"count": 0, "total_price": Decimal(0)})
    for p in properties:
        month_key = p.created_at.strftime("%Y-%m")
        monthly[month_key]["count"] += 1
        monthly[month_key]["total_price"] += p.price

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph(f"Property Sales Report - {current_user.full_name}", styles["Title"]))
    elements.append(Spacer(1, 12 * mm))
    elements.append(Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}", styles["Normal"]))
    elements.append(Spacer(1, 6 * mm))

    summary_data = [
        ["Metric", "Value"],
        ["Total Properties", str(total_properties)],
        ["Average Price", f"${avg_price:,.2f}"],
        ["Total Views", str(total_views)],
        ["Total Phone Clicks", str(total_phone_clicks)],
    ]
    summary_table = Table(summary_data, colWidths=[120 * mm, 80 * mm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 12 * mm))

    elements.append(Paragraph("Monthly Sales Breakdown", styles["Heading2"]))
    elements.append(Spacer(1, 6 * mm))

    month_data = [["Month", "Listings", "Total Price"]]
    for month_key in sorted(monthly.keys()):
        m = monthly[month_key]
        month_data.append([month_key, str(m["count"]), f"${float(m['total_price']):,.2f}"])
    month_table = Table(month_data, colWidths=[60 * mm, 60 * mm, 80 * mm])
    month_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(month_table)

    doc.build(elements)
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="application/pdf")
