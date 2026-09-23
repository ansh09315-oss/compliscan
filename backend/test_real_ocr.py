import os
# Disable oneDNN to prevent PIR attribute error on Windows CPU
os.environ["FLAGS_use_mkldnn"] = "0"

import sys
from paddleocr import PaddleOCR

if len(sys.argv) < 2:
    print("[ERROR] Photo ka path nahi mila!")
    sys.exit(1)

img_path = sys.argv[1]
print(f"\nTarget Photo: {img_path}")

ocr = PaddleOCR(use_textline_orientation=True, lang='en')
results = ocr.ocr(img_path)

print("\n================ OCR EXTRACTED TEXT ================")
if results and results[0]:
    for line in results[0]:
        text = line[1][0]
        conf = line[1][1]
        print(f"[{round(conf * 100)}%] {text}")
else:
    print("No text detected in image!")
print("====================================================\n")