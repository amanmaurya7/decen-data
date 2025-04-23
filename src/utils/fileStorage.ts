
import { FileInterface } from '@/types/file';

export const saveFilesToLocalStorage = (files: FileInterface[]) => {
  try {
    const filesForStorage = files.map(file => ({
      ...file,
      uploadDate: file.uploadDate.toISOString()
    }));
    localStorage.setItem('decendata_files', JSON.stringify(filesForStorage));
  } catch (error) {
    console.error("Error saving files to localStorage:", error);
  }
};

export const loadFilesFromLocalStorage = (): FileInterface[] => {
  try {
    const filesString = localStorage.getItem('decendata_files');
    if (!filesString) return [];
    
    const files = JSON.parse(filesString);
    return files.map((file: any) => ({
      ...file,
      uploadDate: new Date(file.uploadDate)
    }));
  } catch (error) {
    console.error("Error loading files from localStorage:", error);
    return [];
  }
};
