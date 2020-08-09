import { fromJS } from 'immutable';
import * as i18n from '../i18n';

describe('i18n', () => {
  describe('hasI18n', () => {
    it('should return false for collection with no i18n', () => {
      expect(i18n.hasI18n(fromJS({}))).toBe(false);
    });

    it('should return true for collection with i18n', () => {
      expect(i18n.hasI18n(fromJS({ i18n: { structure: i18n.I18N_STRUCTURE.SINGLE_FILE } }))).toBe(
        true,
      );
    });
  });

  describe('getI18nInfo', () => {
    it('should return empty object for collection with no i18n', () => {
      expect(i18n.getI18nInfo(fromJS({}))).toEqual({});
    });

    it('should return i18n object for collection with i18n', () => {
      const i18nObject = {
        locales: ['en', 'de'],
        default_locale: 'en',
        structure: i18n.I18N_STRUCTURE.MULTIPLE_FOLDERS,
      };
      expect(i18n.getI18nInfo(fromJS({ i18n: i18nObject }))).toEqual({
        locales: ['en', 'de'],
        defaultLocale: 'en',
        structure: i18n.I18N_STRUCTURE.MULTIPLE_FOLDERS,
      });
    });
  });

  describe('getI18nFilesDepth', () => {
    it('should increase depth when i18n structure is I18N_STRUCTURE.MULTIPLE_FOLDERS', () => {
      expect(
        i18n.getI18nFilesDepth(
          fromJS({ i18n: { structure: i18n.I18N_STRUCTURE.MULTIPLE_FOLDERS } }),
          5,
        ),
      ).toBe(6);
    });

    it('should return current depth when i18n structure is not I18N_STRUCTURE.MULTIPLE_FOLDERS', () => {
      expect(
        i18n.getI18nFilesDepth(
          fromJS({ i18n: { structure: i18n.I18N_STRUCTURE.MULTIPLE_FILES } }),
          5,
        ),
      ).toBe(5);
      expect(
        i18n.getI18nFilesDepth(fromJS({ i18n: { structure: i18n.I18N_STRUCTURE.SINGLE_FILE } }), 5),
      ).toBe(5);
      expect(i18n.getI18nFilesDepth(fromJS({}), 5)).toBe(5);
    });
  });

  describe('isFieldTranslatable', () => {
    it('should return true when not default locale and has I18N_FIELD.TRANSLATE', () => {
      expect(
        i18n.isFieldTranslatable(fromJS({ i18n: i18n.I18N_FIELD.TRANSLATE }), 'en', 'de'),
      ).toBe(true);
    });

    it('should return false when default locale and has I18N_FIELD.TRANSLATE', () => {
      expect(
        i18n.isFieldTranslatable(fromJS({ i18n: i18n.I18N_FIELD.TRANSLATE }), 'en', 'en'),
      ).toBe(false);
    });

    it("should return false when doesn't have i18n", () => {
      expect(i18n.isFieldTranslatable(fromJS({}), 'en', 'en')).toBe(false);
    });
  });

  describe('isFieldDuplicate', () => {
    it('should return true when not default locale and has I18N_FIELD.TRANSLATE', () => {
      expect(i18n.isFieldDuplicate(fromJS({ i18n: i18n.I18N_FIELD.DUPLICATE }), 'en', 'de')).toBe(
        true,
      );
    });

    it('should return false when default locale and has I18N_FIELD.TRANSLATE', () => {
      expect(i18n.isFieldDuplicate(fromJS({ i18n: i18n.I18N_FIELD.DUPLICATE }), 'en', 'en')).toBe(
        false,
      );
    });

    it("should return false when doesn't have i18n", () => {
      expect(i18n.isFieldDuplicate(fromJS({}), 'en', 'en')).toBe(false);
    });
  });

  describe('isFieldHidden', () => {
    it('should return true when not default locale and has I18N_FIELD.NONE', () => {
      expect(i18n.isFieldHidden(fromJS({ i18n: i18n.I18N_FIELD.NONE }), 'en', 'de')).toBe(true);
    });

    it('should return false when default locale and has I18N_FIELD.NONE', () => {
      expect(i18n.isFieldHidden(fromJS({ i18n: i18n.I18N_FIELD.NONE }), 'en', 'en')).toBe(false);
    });

    it("should return false when doesn't have i18n", () => {
      expect(i18n.isFieldHidden(fromJS({}), 'en', 'en')).toBe(false);
    });
  });

  describe('getLocaleDataPath', () => {
    it('should return string array with locale as part of the data path', () => {
      expect(i18n.getLocaleDataPath('de')).toEqual(['i18n', 'de', 'data']);
    });
  });

  describe('getDataPath', () => {
    it('should not include locale in path for default locale', () => {
      expect(i18n.getDataPath('en', 'en')).toEqual(['data']);
    });

    it('should include locale in path for non default locale', () => {
      expect(i18n.getDataPath('de', 'en')).toEqual(['i18n', 'de', 'data']);
    });
  });

  describe('getFilePath', () => {
    const args = ['md', 'src/content/index.md', 'index', 'de'];
    it('should return directory path based on locale when structure is I18N_STRUCTURE.MULTIPLE_FOLDERS', () => {
      expect(i18n.getFilePath(i18n.I18N_STRUCTURE.MULTIPLE_FOLDERS, ...args)).toEqual(
        'src/content/de/index.md',
      );
    });

    it('should return file path based on locale when structure is I18N_STRUCTURE.MULTIPLE_FILES', () => {
      expect(i18n.getFilePath(i18n.I18N_STRUCTURE.MULTIPLE_FILES, ...args)).toEqual(
        'src/content/index.de.md',
      );
    });

    it('should not modify path when structure is I18N_STRUCTURE.SINGLE_FILE', () => {
      expect(i18n.getFilePath(i18n.I18N_STRUCTURE.SINGLE_FILE, ...args)).toEqual(
        'src/content/index.md',
      );
    });
  });

  describe('getFilePaths', () => {
    const args = ['md', 'src/content/index.md', 'index'];

    it('should return file paths for all locales', () => {
      expect(
        i18n.getFilePaths(
          fromJS({
            i18n: { structure: i18n.I18N_STRUCTURE.MULTIPLE_FOLDERS, locales: ['en', 'de'] },
          }),
          ...args,
        ),
      ).toEqual(['src/content/en/index.md', 'src/content/de/index.md']);
    });
  });

  describe('normalizeFilePath', () => {
    it('should remove locale folder from path when structure is I18N_STRUCTURE.MULTIPLE_FOLDERS', () => {
      expect(
        i18n.normalizeFilePath(
          i18n.I18N_STRUCTURE.MULTIPLE_FOLDERS,
          'src/content/en/index.md',
          'en',
        ),
      ).toEqual('src/content/index.md');
    });

    it('should remove locale extension from path when structure is I18N_STRUCTURE.MULTIPLE_FILES', () => {
      expect(
        i18n.normalizeFilePath(i18n.I18N_STRUCTURE.MULTIPLE_FILES, 'src/content/index.en.md', 'en'),
      ).toEqual('src/content/index.md');
    });

    it('should not modify path when structure is I18N_STRUCTURE.SINGLE_FILE', () => {
      expect(
        i18n.normalizeFilePath(i18n.I18N_STRUCTURE.SINGLE_FILE, 'src/content/index.md', 'en'),
      ).toEqual('src/content/index.md');
    });
  });

  describe('getI18nFiles', () => {
    const locales = ['en', 'de', 'fr'];
    const default_locale = 'en';
    const args = [
      'md',
      fromJS({
        data: { title: 'en_title' },
        i18n: { de: { data: { title: 'de_title' } }, fr: { data: { title: 'fr_title' } } },
      }),
      map => map.get('data').toJS(),
      'src/content/index.md',
      'index',
    ];
    it('should return a single file when structure is I18N_STRUCTURE.SINGLE_FILE', () => {
      expect(
        i18n.getI18nFiles(
          fromJS({ i18n: { structure: i18n.I18N_STRUCTURE.SINGLE_FILE, locales, default_locale } }),
          ...args,
        ),
      ).toEqual([
        {
          path: 'src/content/index.md',
          raw: {
            en: { title: 'en_title' },
            de: { title: 'de_title' },
            fr: { title: 'fr_title' },
          },
          slug: 'index',
        },
      ]);
    });

    it('should return a folder based files when structure is I18N_STRUCTURE.MULTIPLE_FOLDERS', () => {
      expect(
        i18n.getI18nFiles(
          fromJS({
            i18n: { structure: i18n.I18N_STRUCTURE.MULTIPLE_FOLDERS, locales, default_locale },
          }),
          ...args,
        ),
      ).toEqual([
        {
          path: 'src/content/en/index.md',
          raw: { title: 'en_title' },
          slug: 'index',
        },
        {
          path: 'src/content/de/index.md',
          raw: { title: 'de_title' },
          slug: 'index',
        },
        {
          path: 'src/content/fr/index.md',
          raw: { title: 'fr_title' },
          slug: 'index',
        },
      ]);
    });

    it('should return a extension based files when structure is I18N_STRUCTURE.MULTIPLE_FILES', () => {
      expect(
        i18n.getI18nFiles(
          fromJS({
            i18n: { structure: i18n.I18N_STRUCTURE.MULTIPLE_FILES, locales, default_locale },
          }),
          ...args,
        ),
      ).toEqual([
        {
          path: 'src/content/index.en.md',
          raw: { title: 'en_title' },
          slug: 'index',
        },
        {
          path: 'src/content/index.de.md',
          raw: { title: 'de_title' },
          slug: 'index',
        },
        {
          path: 'src/content/index.fr.md',
          raw: { title: 'fr_title' },
          slug: 'index',
        },
      ]);
    });
  });

  describe('getI18nEntry', () => {
    const locales = ['en', 'de', 'fr', 'es'];
    const default_locale = 'en';
    const args = ['md', 'src/content/index.md', 'index'];

    it('should return i18n entry content when structure is I18N_STRUCTURE.MULTIPLE_FOLDERS', async () => {
      const data = {
        'src/content/en/index.md': {
          slug: 'index',
          path: 'src/content/en/index.md',
          data: { title: 'en_title' },
        },
        'src/content/de/index.md': {
          slug: 'index',
          path: 'src/content/de/index.md',
          data: { title: 'de_title' },
        },
        'src/content/fr/index.md': {
          slug: 'index',
          path: 'src/content/fr/index.md',
          data: { title: 'fr_title' },
        },
      };
      const getEntryValue = jest.fn(path =>
        data[path] ? Promise.resolve(data[path]) : Promise.reject('Not found'),
      );

      await expect(
        i18n.getI18nEntry(
          fromJS({
            i18n: { structure: i18n.I18N_STRUCTURE.MULTIPLE_FOLDERS, locales, default_locale },
          }),
          ...args,
          getEntryValue,
        ),
      ).resolves.toEqual({
        slug: 'index',
        path: 'src/content/index.md',
        data: { title: 'en_title' },
        i18n: {
          de: { data: { title: 'de_title' } },
          fr: { data: { title: 'fr_title' } },
        },
        raw: '',
      });
    });

    it('should return i18n entry content when structure is I18N_STRUCTURE.MULTIPLE_FILES', async () => {
      const data = {
        'src/content/index.en.md': {
          slug: 'index',
          path: 'src/content/index.en.md',
          data: { title: 'en_title' },
        },
        'src/content/index.de.md': {
          slug: 'index',
          path: 'src/content/index.de.md',
          data: { title: 'de_title' },
        },
        'src/content/index.fr.md': {
          slug: 'index',
          path: 'src/content/index.fr.md',
          data: { title: 'fr_title' },
        },
      };
      const getEntryValue = jest.fn(path =>
        data[path] ? Promise.resolve(data[path]) : Promise.reject('Not found'),
      );

      await expect(
        i18n.getI18nEntry(
          fromJS({
            i18n: { structure: i18n.I18N_STRUCTURE.MULTIPLE_FILES, locales, default_locale },
          }),
          ...args,
          getEntryValue,
        ),
      ).resolves.toEqual({
        slug: 'index',
        path: 'src/content/index.md',
        data: { title: 'en_title' },
        i18n: {
          de: { data: { title: 'de_title' } },
          fr: { data: { title: 'fr_title' } },
        },
        raw: '',
      });
    });

    it('should return single entry content when structure is I18N_STRUCTURE.SINGLE_FILE', async () => {
      const data = {
        'src/content/index.md': {
          slug: 'index',
          path: 'src/content/index.md',
          data: {
            en: { title: 'en_title' },
            de: { title: 'de_title' },
            fr: { title: 'fr_title' },
          },
        },
      };
      const getEntryValue = jest.fn(path => Promise.resolve(data[path]));

      await expect(
        i18n.getI18nEntry(
          fromJS({
            i18n: { structure: i18n.I18N_STRUCTURE.SINGLE_FILE, locales, default_locale },
          }),
          ...args,
          getEntryValue,
        ),
      ).resolves.toEqual({
        slug: 'index',
        path: 'src/content/index.md',
        data: {
          en: { title: 'en_title' },
          de: { title: 'de_title' },
          fr: { title: 'fr_title' },
        },
      });
    });
  });
});
