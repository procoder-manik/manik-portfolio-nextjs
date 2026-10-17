# Generates tall placeholder "full-page screenshots" so the hover-scroll works out of the box.
# Replace them from the admin panel with real full-page screenshots of each site.
import random, os
P = [
("jslaw","JS Law","Legal services","#4F46E5"),("bmccentre","BMC Centre","Healthcare & community","#0D9488"),
("johnportermd","Dr. John Porter, MD","Medical practice","#0284C7"),("liteforcechiro","LiteForce Chiropractic","Chiropractic care","#EA580C"),
("trueathletetraining","True Athlete Training","Sports & fitness","#DC2626"),("couplestherapymanchester","Couples Therapy Manchester","Counselling & therapy","#DB2777"),
("divanodesigns","Divano Designs","Interior design studio","#7C3AED"),("fusionflo","FusionFlo","Digital services agency","#0891B2"),
("seoshut","SEOShut","SEO agency","#16A34A"),("montrealseoagency","Montreal SEO Agency","SEO agency","#D97706"),
("edmontonmortgagebroker","Edmonton Mortgage Broker","Mortgage brokerage","#2563EB"),("kingshomecarenj","Kings Home Care NJ","Home care services","#E11D48"),
("twobrosfoundationrepair","Two Bros Foundation Repair","Foundation repair","#B45309"),("storefriendly","Store Friendly","Self-storage","#475569"),
]
def esc(s): return s.replace("&","&amp;")
for slug,name,ind,acc in P:
    r = random.Random(slug); W=1440; y=0; o=[]
    dark = r.random()<0.35
    bg = "#0F172A" if dark else "#FFFFFF"; fg = "#F8FAFC" if dark else "#0F172A"; mu = "#94A3B8" if dark else "#64748B"; card = "#1E293B" if dark else "#F1F5F9"
    o.append(f'<rect x="0" y="0" width="{W}" height="90" fill="{bg}"/><circle cx="80" cy="45" r="16" fill="{acc}"/><text x="110" y="53" font-family="Arial" font-weight="700" font-size="24" fill="{fg}">{esc(name)}</text>')
    for i,t in enumerate(["Home","About","Services","Results","Contact"]):
        o.append(f'<text x="{760+i*110}" y="52" font-family="Arial" font-size="17" fill="{mu}">{t}</text>')
    o.append(f'<rect x="1270" y="25" width="120" height="42" rx="21" fill="{acc}"/><text x="1300" y="52" font-family="Arial" font-size="16" font-weight="700" fill="#fff">Book now</text>')
    y=90
    o.append(f'<rect x="0" y="{y}" width="{W}" height="760" fill="{acc}"/><rect x="0" y="{y}" width="{W}" height="760" fill="url(#hg)"/>')
    o.append(f'<text x="100" y="{y+260}" font-family="Arial" font-weight="800" font-size="76" fill="#fff">{esc(name)}</text>')
    o.append(f'<text x="100" y="{y+340}" font-family="Arial" font-size="30" fill="#ffffffcc">{esc(ind)} that people trust.</text>')
    o.append(f'<rect x="100" y="{y+410}" width="240" height="64" rx="32" fill="#fff"/><text x="140" y="{y+450}" font-family="Arial" font-weight="700" font-size="20" fill="{acc}">Get started</text>')
    o.append(f'<rect x="370" y="{y+410}" width="220" height="64" rx="32" fill="none" stroke="#fff" stroke-width="2"/><text x="415" y="{y+450}" font-family="Arial" font-size="20" fill="#fff">Learn more</text>')
    o.append(f'<rect x="830" y="{y+120}" width="520" height="520" rx="28" fill="#ffffff22"/><rect x="870" y="{y+160}" width="440" height="300" rx="18" fill="#ffffff33"/><rect x="870" y="{y+490}" width="300" height="22" rx="11" fill="#ffffff55"/><rect x="870" y="{y+530}" width="380" height="22" rx="11" fill="#ffffff33"/>')
    y+=760
    for s in range(r.randint(5,7)):
        h = r.choice([620,700,560,760]); kind = r.choice(["cards","split","stats","quote","grid"])
        sbg = bg if s%2==0 else card
        o.append(f'<rect x="0" y="{y}" width="{W}" height="{h}" fill="{sbg}"/>')
        o.append(f'<text x="100" y="{y+110}" font-family="Arial" font-weight="800" font-size="44" fill="{fg}">{r.choice(["Our services","Why choose us","How it works","What clients say","Results that matter","Meet the team","Frequently asked"])}</text>')
        o.append(f'<rect x="100" y="{y+140}" width="560" height="16" rx="8" fill="{mu}" opacity=".5"/>')
        if kind=="cards":
            for c in range(3):
                x=100+c*420; o.append(f'<rect x="{x}" y="{y+210}" width="380" height="{h-290}" rx="22" fill="{card if sbg==bg else bg}"/><circle cx="{x+60}" cy="{y+270}" r="28" fill="{acc}" opacity=".9"/><rect x="{x+32}" y="{y+330}" width="250" height="20" rx="10" fill="{fg}" opacity=".85"/><rect x="{x+32}" y="{y+370}" width="310" height="12" rx="6" fill="{mu}" opacity=".6"/><rect x="{x+32}" y="{y+394}" width="280" height="12" rx="6" fill="{mu}" opacity=".6"/>')
        elif kind=="split":
            o.append(f'<rect x="100" y="{y+210}" width="600" height="{h-290}" rx="24" fill="{acc}" opacity=".18"/><rect x="760" y="{y+230}" width="520" height="26" rx="13" fill="{fg}" opacity=".8"/>')
            for k in range(5): o.append(f'<rect x="760" y="{y+290+k*34}" width="{r.randint(380,580)}" height="13" rx="6" fill="{mu}" opacity=".55"/>')
            o.append(f'<rect x="760" y="{y+480}" width="200" height="56" rx="28" fill="{acc}"/>')
        elif kind=="stats":
            for c in range(4):
                x=100+c*315; o.append(f'<text x="{x}" y="{y+320}" font-family="Arial" font-weight="800" font-size="70" fill="{acc}">{r.randint(12,980)}{r.choice(["+","%","k"])}</text><rect x="{x}" y="{y+350}" width="200" height="14" rx="7" fill="{mu}" opacity=".6"/>')
        elif kind=="quote":
            o.append(f'<text x="100" y="{y+300}" font-family="Georgia" font-size="38" font-style="italic" fill="{fg}">"Absolutely fantastic service from start to finish.</text><text x="100" y="{y+352}" font-family="Georgia" font-size="38" font-style="italic" fill="{fg}">We could not be happier with the result."</text><circle cx="130" cy="{y+440}" r="30" fill="{acc}"/><rect x="180" y="{y+425}" width="200" height="16" rx="8" fill="{fg}" opacity=".7"/>')
        else:
            for c in range(8):
                x=100+(c%4)*315; yy=y+200+(c//4)*((h-260)//2); o.append(f'<rect x="{x}" y="{yy}" width="290" height="{(h-300)//2}" rx="18" fill="{acc}" opacity="{0.15+0.1*(c%3)}"/>')
        y+=h
    o.append(f'<rect x="0" y="{y}" width="{W}" height="420" fill="{acc}"/><text x="{W/2}" y="{y+170}" text-anchor="middle" font-family="Arial" font-weight="800" font-size="52" fill="#fff">Ready to talk?</text><rect x="{W/2-130}" y="{y+220}" width="260" height="64" rx="32" fill="#fff"/><text x="{W/2}" y="{y+260}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="20" fill="{acc}">Contact us</text>')
    y+=420
    o.append(f'<rect x="0" y="{y}" width="{W}" height="320" fill="#0B1220"/><text x="100" y="{y+90}" font-family="Arial" font-weight="700" font-size="26" fill="#fff">{esc(name)}</text>')
    for c in range(3):
        for k in range(4): o.append(f'<rect x="{600+c*260}" y="{y+70+k*36}" width="{r.randint(100,180)}" height="12" rx="6" fill="#ffffff44"/>')
    y+=320
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {y}" width="{W}" height="{y}"><defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>'+"".join(o)+'</svg>'
    open(f"public/seed/shots/{slug}.svg","w").write(svg)
print("ok")
