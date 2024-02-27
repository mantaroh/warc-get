# Import library
from PIL import Image
import numpy as np
import glob
import random
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Activation, Conv2D, MaxPooling2D, Dropout, BatchNormalization, Flatten
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt
import pickle

## Memory Revamp
import tensorflow as tf
from keras import backend as K
config = tf.compat.v1.ConfigProto()
#config.gpu_options.allow_growth = False
config.gpu_options.per_process_gpu_memory_fraction = 0.5
sess = tf.compat.v1.Session(config=config)
#K.set_session(sess)
tf.compat.v1.keras.backend.set_session(sess)

cols = 128
rows = 128
base_dir='./components-only'
dirs = sorted(glob.glob(base_dir + '/*'))
Xdata = []
Ydata = []

for i in range(len(dirs)):
    print(dirs[i])
    pics = sorted(glob.glob(dirs[i] + '/*.png'))
    for j in range(len(pics)):
        img = Image.open(pics[j])
        img = img.resize((cols, rows))
        img=np.array(img) / 255
        Xdata.append(img)
        Y=np.zeros(len(dirs), np.uint8)
        Y[i]=1
        Ydata.append(Y)
Xdata = np.array(Xdata)
Ydata = np.array(Ydata)
print(Xdata.shape)
print(Ydata.shape)

# Shuffle data
num_data = len(Xdata)
shuffle_list = random.sample(range(0, num_data), num_data)
Xdata = Xdata[shuffle_list]
Ydata = Ydata[shuffle_list]
validation_split = 0.2
X_train=Xdata[:int(len(Xdata) * (1 - validation_split))]
X_valid=Xdata[-int(len(Xdata) * (validation_split)):]
Y_train=Ydata[:int(len(Ydata) * (1 - validation_split))]
Y_valid=Ydata[-int(len(Ydata) * (validation_split)):]

# Build model
model = Sequential()
model.add(Conv2D(128, (3, 3), padding='same',input_shape=(128, 128,4), activation='relu'))
model.add(BatchNormalization())
model.add(MaxPooling2D(pool_size=(2, 2)))     
model.add(Conv2D(64, (3, 3), activation='relu'))
model.add(BatchNormalization())
model.add(MaxPooling2D((2, 2)))    
model.add(Conv2D(64, (3, 3), activation='relu'))
model.add(BatchNormalization())
model.add(MaxPooling2D((2, 2)))       
model.add(Conv2D(32, (3, 3), activation='relu'))
model.add(BatchNormalization())
model.add(MaxPooling2D((2, 2)))             
model.add(Conv2D(32, (3, 3), activation='relu'))
model.add(BatchNormalization())
model.add(MaxPooling2D((2, 2)))                            
model.add(Flatten())
model.add(Dense(128, activation='relu'))      
model.add(Dropout(0.5))
model.add(Dense(128, activation='relu'))      
model.add(Dropout(0.5))
model.add(Dense(11, activation='softmax'))
model.compile(loss='categorical_crossentropy',optimizer=Adam(lr=0.001),metrics=['accuracy'])
model.summary()

#history=model.fit(X_train,Y_train,batch_size=128,epochs=100,validation_data=(X_valid,Y_valid))
#Memory Revamp (GPU)
history=model.fit(X_train,Y_train,batch_size=10,epochs=100,validation_data=(X_valid,Y_valid))
#学習結果の可視化
plt.plot(history.history['accuracy'])
plt.plot(history.history['val_accuracy'])
plt.title('Model accuracy')
plt.ylabel('Accuracy')
plt.xlabel('Epoch')
plt.grid()
plt.legend(['Train','Validation'],loc='upper left')
plt.show()
plt.savefig('result2.png')

pickle.dump(model, open('model.pkl', 'wb'))
