/* Download Organizer: local-only sorting when a new download's filename is determined. */
const KEY="downloadOrganizerEnabled";
const folders={
  Images:new Set(["jpg","jpeg","png","gif","webp","svg","bmp","ico","heic","avif","tif","tiff"]),
  Videos:new Set(["mp4","mov","avi","mkv","webm","mpeg","mpg","m4v","wmv"]),
  Music:new Set(["mp3","wav","flac","aac","ogg","m4a","wma","opus"]),
  Documents:new Set(["pdf","doc","docx","txt","rtf","odt","md","xls","xlsx","csv","ppt","pptx","epub","pages","numbers"]),
  Archives:new Set(["zip","rar","7z","tar","gz","tgz","bz2","xz"]),
  Applications:new Set(["exe","msi","msix","dmg","pkg","deb","rpm","apk","appimage"])
};
function categoryFor(filename,mime=""){
  const ext=/\.([a-z0-9]{1,12})$/i.exec(filename)?.[1]?.toLowerCase()||"";
  for(const [category,extensions] of Object.entries(folders))if(extensions.has(ext))return category;
  if(mime.startsWith("image/"))return "Images";
  if(mime.startsWith("video/"))return "Videos";
  if(mime.startsWith("audio/"))return "Music";
  if(mime==="application/pdf"||mime.startsWith("text/"))return "Documents";
  return "Others";
}
function safeName(input){
  let part=String(input||"").replace(/\\/g,"/").split("/").pop()||"download";
  part=part.replace(/[<>:"|?*\u0000-\u001f]/g,"_").replace(/\.+$/,"").trim();
  if(!part||part==="."||part==="..")part="download";
  return part.slice(0,180);
}
chrome.runtime.onInstalled.addListener(async()=>{const state=await chrome.storage.local.get(KEY);if(!(KEY in state))await chrome.storage.local.set({[KEY]:true})});
chrome.downloads.onDeterminingFilename.addListener((item,suggest)=>{
  // Use callback-based storage, because returning a Promise from this listener is not supported.
  chrome.storage.local.get(KEY,result=>{
    if(chrome.runtime.lastError){suggest();return}
    if(result[KEY]===false){suggest();return}
    // Preserve nested filenames for deliberate extension-driven downloads and avoid re-routing our own subfolders.
    const raw=String(item.filename||"").replace(/\\/g,"/");
    const normalized=raw.split("/").filter(Boolean);
    if(normalized.length>1&&!/^[a-z]:$/i.test(normalized[0])){suggest();return}
    const filename=safeName(raw);
    const category=categoryFor(filename,item.mime||"");
    suggest({filename:"Organized Downloads/"+category+"/"+filename,conflictAction:"uniquify"});
  });
  return true;
});
