const STORAGE_KEY = 'dominion_rent';

export const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  return null;
};

export const saveData = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const exportToJSON = (state) => {
  const dataStr = JSON.stringify(state, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `dominion_rent_backup_${new Date().toISOString().split('T')[0]}.json`;
  
  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.rooms && data.tenants && data.tenancies && data.bills && data.settings) {
          resolve(data);
        } else {
          reject(new Error("Invalid backup file format."));
        }
      } catch (err) {
        reject(new Error("Failed to parse JSON file."));
      }
    };
    reader.onerror = () => reject(new Error("Error reading file."));
    reader.readAsText(file);
  });
};
