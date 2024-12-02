import scipy.io
import numpy as np
import matplotlib.pyplot as plt

# Load the .mat file
mat_data = scipy.io.loadmat('synth.mat')

# Extract seismic data and axes
seismic_data = mat_data['D']  # Seismic data matrix
offset = mat_data['offset'].flatten()  # Flatten to 1D
time_axis = mat_data['t'].flatten()  # Flatten to 1D

# Normalize the seismic data for better visualization
seismic_normalized = seismic_data / np.max(np.abs(seismic_data))

# Plot the seismic data as a heatmap
plt.figure(figsize=(12, 6))
plt.imshow(
    seismic_normalized,
    aspect='auto',
    cmap='seismic',  # Red-blue colormap to emphasize polarity
    extent=[offset[0], offset[-1], time_axis[-1], time_axis[0]]  # Proper axis scaling
)

# Add labels and title
plt.colorbar(label='Amplitude')
plt.xlabel('Offset (m)')
plt.ylabel('Time (s)')
plt.title('Shot Record')

# Show the plot
plt.tight_layout()
plt.savefig('shot_record.png', dpi=300)
plt.show()
