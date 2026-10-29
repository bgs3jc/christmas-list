import sys, cv2, numpy as np
src, dst = sys.argv[1], sys.argv[2]
im = cv2.imread(src).astype(np.int32)
# the four sky bands: cobalt, violet-blue, magenta, orange (BGR)
sky = np.array([[0xC4, 0x39, 0x00], [0xC9, 0x42, 0x2C], [0xA8, 0x38, 0xB3], [0x3D, 0x51, 0xFF], [0xC4, 0x70, 0x79]])
d = np.min(np.linalg.norm(im[:, :, None, :] - sky[None, None], axis=3), axis=2)
cand = (d < 30).astype(np.uint8)
# only sky that connects to the top edge (keeps out the lantern glow and sidewalk stripes)
bridged = cv2.dilate(cand, np.ones((5, 5), np.uint8))
n, lab = cv2.connectedComponents(bridged, connectivity=8)
top = set(np.unique(lab[0])) - {0}
keep = np.isin(lab, list(top))
# sky glimpsed through the oak's crown: pockets that sit wholly in the
# upper left, clear of the house (given as fractions of width and height)
# Two boxes: one low on the far left, one wider but above the roofline.
boxes = [(float(sys.argv[3]), float(sys.argv[4])), (float(sys.argv[5]), float(sys.argv[6]))]
H, W = cand.shape
n2, lab2, stats, _ = cv2.connectedComponentsWithStats(cand, connectivity=8)
for c in range(1, n2):
    x, y, w, h, area = stats[c]
    if area > 150 and any(x + w < W * bw and y + h < H * bh for bw, bh in boxes):
        keep |= lab2 == c
mask = (keep & (cand == 1)).astype(np.uint8) * 255
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
rgba = np.zeros((*mask.shape, 4), np.uint8); rgba[..., :3] = 255; rgba[..., 3] = mask
cv2.imwrite(dst, rgba, [cv2.IMWRITE_PNG_COMPRESSION, 9])
cv2.imwrite(dst.replace('.png', '-preview.png'), mask)
print(dst, mask.mean() / 255)
