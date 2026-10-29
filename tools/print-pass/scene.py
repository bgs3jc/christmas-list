# usage: scene.py src out  [view_x0 view_y0 view_size]
# The globe shows the stored square's region x 0.1-0.9, y 0.06-0.86. This
# reframes a scene so that region shows the given view of the original.
import sys, cv2, numpy as np
from sklearn.cluster import KMeans
src, out = sys.argv[1], sys.argv[2]
vx, vy, vs = (float(a) for a in sys.argv[3:6]) if len(sys.argv) > 3 else (0.1, 0.06, 0.8)
img = cv2.imread(src); H, W = img.shape[:2]
k = vs / 0.8                       # original units per stored unit
ox, oy = vx - 0.1 * k, vy - 0.06 * k
M = np.float32([[k, 0, ox * W], [0, k, oy * H]])
img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_AREA | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
flat = cv2.pyrMeanShiftFiltering(img, sp=6, sr=20)
lab = cv2.cvtColor(flat, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
km = KMeans(n_clusters=18, n_init=4, random_state=2).fit(lab[::4])
labels = cv2.medianBlur(km.predict(lab).reshape(H, W).astype(np.uint8), 3)
inks = cv2.cvtColor(np.clip(km.cluster_centers_, 0, 255).astype(np.uint8)[None], cv2.COLOR_LAB2BGR)[0]
cv2.imwrite(out, inks[labels])
