
export async function getSectionsData(url) {
  try {
    let sectionsData;
    const sectionsDataURL = `http://localhost:3000/sections-data?url=${url}`;
    const resp = await fetch(sectionsDataURL);
    if (resp.status !== 200) {
      throw new Error(`Could not get sections data at ${sectionsDataURL}: ${resp.status}`);
    }
    sectionsData = resp.json();
    return sectionsData;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
