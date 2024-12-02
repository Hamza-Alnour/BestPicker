import scipy.io
import numpy as np
import json
import matplotlib.pyplot as plt

# Load the .mat file
mat_data = scipy.io.loadmat('synth.mat')

# Extract the seismic data from 'D'
if 'D' in mat_data:
    seismic_data = mat_data['D']
else:
    raise KeyError("The variable 'D' was not found in the .mat file.")

# Normalize and save as image
seismic_image = (seismic_data - np.min(seismic_data)) / (np.max(seismic_data) - np.min(seismic_data)) * 255
seismic_image = seismic_image.astype(np.uint8)

plt.imsave('seismic_image.png', seismic_image, cmap='gray')

# Save as JSON
with open('seismic_data.json', 'w') as f:
    json.dump(seismic_image.tolist(), f)

print("Files saved: seismic_image.png and seismic_data.json")
