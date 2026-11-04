import subprocess
import os

def generate():
    os.makedirs("public/weather", exist_ok=True)
    
    # 1. Sunny Skies: Deep Azure Sky -> Cyan horizon with glowing sun and soft moving clouds
    cmd_sunny = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "mandelbrot=s=1280x720:rate=30:maxiter=20,format=yuv420p",
        "-f", "lavfi",
        "-i", "gradients=s=1280x720:c0=0x0d47a1:c1=0x42a5f5:d=8:r=30",
        "-f", "lavfi",
        "-i", "color=c=0xffeb3b:s=240x240:d=8:r=30,format=rgba,geq=r='255':g='230':b='80':a='clip(255*(1 - (hypot(X-120,Y-120)/120)), 0, 255)'",
        "-filter_complex",
        "[1:v][2:v]overlay=x=880:y=70:shortest=1[sun];"
        "[sun]drawbox=y=520:color=0x1976d2@0.4:width=1280:height=200:t=fill[v0];"
        "[v0]drawgrid=width=1280:height=720:thickness=0:color=white[out]",
        "-map", "[out]",
        "-t", "8",
        "-c:v", "libx264",
        "-profile:v", "high",
        "-level", "4.0",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-movflags", "+faststart",
        "public/weather/sunny.mp4"
    ]

    # Let's write rich visual generators using lavfi filters
