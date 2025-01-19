#!/usr/bin/env python
# coding: utf-8

# In[38]:


import pandas as pd
import numpy as np 
import matplotlib.pyplot as plt
import seaborn as sns
# get_ipython().run_line_magic('matplotlib', 'inline')


# In[63]:


df = pd.read_csv('habit_scores_sample.csv')


# In[64]:


df.head()


# In[65]:


df.describe()


# In[66]:


sns.pairplot(df)


# In[68]:


#convert days to a date format 
df['day'] = pd.to_datetime(df['day'])
df['day_of_week'] = df['day'].dt.dayofweek  # Monday=0, Sunday=6
df['day_of_year'] = df['day'].dt.dayofyear  # Day of the year (1–365)


# In[69]:


df.head()


# In[70]:


#Features
X = df[['day_of_week','day_of_year']]


# In[71]:


y = df['score']


# In[72]:


from sklearn.model_selection import train_test_split


# In[73]:


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=101)


# In[74]:


from sklearn.linear_model import LinearRegression


# In[75]:


lm = LinearRegression()


# In[76]:


lm.fit(X_train,y_train)


# In[77]:


print(lm.intercept_)


# In[78]:


predictions = lm.predict(X_test)


# In[80]:


plt.scatter(y_test,predictions)


# In[81]:


sns.distplot(y_test-predictions)


# In[82]:


from sklearn import metrics


# In[83]:


metrics.mean_absolute_error(y_test,predictions)


# In[84]:


metrics.mean_squared_error(y_test,predictions)


# In[85]:


np.sqrt(metrics.mean_squared_error(y_test,predictions))


# In[ ]:




