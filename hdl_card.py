from PIL import Image, ImageDraw, ImageFont, ImageOps
import sys,os
F='/usr/share/fonts/truetype/noto/'
GOLD=(255,255,255)
HERE=os.path.dirname(os.path.abspath(__file__))
def grad(w,h):
    im=Image.new('RGB',(w,h)); px=im.load()
    a=(241,106,42); b=(233,55,149)
    for y in range(h):
        for x in range(w):
            t=y/h
            px[x,y]=tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))
    return im
def wrap(d,text,font,maxw):
    out=[];cur=''
    for w in text.split():
        t=(cur+' '+w).strip()
        if d.textlength(t,font=font)<=maxw: cur=t
        else: out.append(cur);cur=w
    out.append(cur);return out
def make(name,w,h,quote,title,bg=None):
    im=grad(w,h)
    if bg:
        ph=ImageOps.fit(Image.open(bg).convert('RGB'),(w,h),Image.LANCZOS)
        im=Image.blend(ph,im,0.82)
    d=ImageDraw.Draw(im);m=int(w*0.085)
    d.text((m,int(h*0.06)),'\u201c',font=ImageFont.truetype(F+'NotoSerif-Bold.ttf',int(w*0.16)),fill=GOLD)
    maxw=w-2*m; top=int(h*0.22); bot=int(h*0.74)
    for sz in range(int(w*0.075),20,-2):
        f=ImageFont.truetype(F+'NotoSerif-SemiBold.ttf',sz);ls=wrap(d,quote,f,maxw);lh=int(sz*1.32)
        if len(ls)*lh<=bot-top:break
    y=top+((bot-top)-len(ls)*lh)//2
    for l in ls: d.text((m,y),l,font=f,fill='white');y+=lh
    ry=int(h*0.775); d.rectangle([m,ry,m+int(w*0.11),ry+4],fill=GOLD)
    tf=ImageFont.truetype(F+'NotoSans-Bold.ttf',int(w*0.032))
    IND=int(w*0.088)
    ts=wrap(d,title,tf,maxw-int(w*0.2)-IND);ty=ry+int(h*0.02);ty0=ty
    for l in ts: d.text((m+IND,ty),l,font=tf,fill=GOLD);ty+=int(w*0.042)
    lf=ImageFont.truetype(F+'NotoSans-Regular.ttf',int(w*0.028))
    d.text((m,ty+int(w*0.008)),'highdefinitionlearning.pages.dev',font=lf,fill=(255,235,240))
    s=int(w*0.068); al=Image.open(os.path.join(HERE,'wink_alpha.png')).resize((s,s),Image.LANCZOS)
    im.paste(Image.new('RGB',(s,s),GOLD),(m-int(w*0.004),ty0-int(w*0.006)),al)
    im.save(name,quality=95)
if __name__=='__main__':
    a=sys.argv; make(a[1],int(a[2]),int(a[3]),a[4],a[5],a[6] if len(a)>6 else None)
