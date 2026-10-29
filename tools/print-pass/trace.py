import sys, vtracer, os
src, dst, mode = sys.argv[1], sys.argv[2], sys.argv[3]
vtracer.convert_image_to_svg_py(
    src, dst,
    colormode='color', hierarchical='stacked', mode=mode,
    filter_speckle=2, color_precision=8, layer_difference=1,
    corner_threshold=70, length_threshold=5.0, max_iterations=10,
    splice_threshold=45, path_precision=2,
)
print(dst, os.path.getsize(dst) // 1024, 'KB')
