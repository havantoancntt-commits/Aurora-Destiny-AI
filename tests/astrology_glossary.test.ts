// ==========================================
// AURORA DESTINY AI — ASTROLOGY GLOSSARY TEST SUITE
// Verifies all terms, search capabilities, category coverage,
// and complete life translations for plain-language understanding.
// ==========================================

import assert from 'node:assert';
import test from 'node:test';
import {
  ASTROLOGY_GLOSSARY,
  searchGlossary,
  getGlossaryItemById,
  GlossaryCategory
} from '../src/data/astrologyGlossary';

test('📖 Astrology Glossary & Explainer Knowledge Base Suite', async (t) => {
  await t.test('1. Glossary contains comprehensive coverage across all 4 core categories', () => {
    assert.ok(ASTROLOGY_GLOSSARY.length >= 15, 'Glossary must contain at least 15 comprehensive terms');

    const categories: GlossaryCategory[] = ['bazi', 'ziwei_palaces', 'ziwei_stars', 'astronomy_rules'];
    categories.forEach((cat) => {
      const itemsInCat = ASTROLOGY_GLOSSARY.filter((item) => item.category === cat);
      assert.ok(itemsInCat.length >= 2, `Category ${cat} must contain at least 2 items`);
    });
  });

  await t.test('2. Every glossary item has required fields without any empty strings', () => {
    ASTROLOGY_GLOSSARY.forEach((item) => {
      assert.ok(item.id && item.id.length > 0, `Item ${item.id} must have valid id`);
      assert.ok(item.termVi && item.termVi.length > 0, `Item ${item.id} must have termVi`);
      assert.ok(item.termEn && item.termEn.length > 0, `Item ${item.id} must have termEn`);
      assert.ok(item.shortDefinition && item.shortDefinition.length > 10, `Item ${item.id} must have meaningful definition`);
      assert.ok(item.lifeMeaning.general && item.lifeMeaning.general.length > 10, `Item ${item.id} must have general life meaning`);
      assert.ok(item.lifeMeaning.careerAndWealth && item.lifeMeaning.careerAndWealth.length > 10, `Item ${item.id} must have career/wealth meaning`);
      assert.ok(item.lifeMeaning.relationshipAndFamily && item.lifeMeaning.relationshipAndFamily.length > 10, `Item ${item.id} must have relationship meaning`);
      assert.ok(item.actionableAdvice && item.actionableAdvice.length > 10, `Item ${item.id} must have actionable advice`);
      assert.ok(item.example && item.example.length > 10, `Item ${item.id} must have real life example`);
      assert.ok(Array.isArray(item.keywords) && item.keywords.length > 0, `Item ${item.id} must have keywords`);
    });
  });

  await t.test('3. Key critical astrological terms are specifically defined', () => {
    const requiredKeys = [
      'nhat_chu',
      'chinh_quan',
      'that_sat',
      'dung_than_hy_than',
      'cung_menh',
      'cung_than',
      'cung_tai_bach',
      'cung_quan_loc',
      'sao_tu_vi',
      'tu_hoa',
      'chan_gio_mat_troi',
      'mieu_vuong_dac_binh_ham',
      'tuan_triet_khong_vong'
    ];

    requiredKeys.forEach((key) => {
      const item = getGlossaryItemById(key);
      assert.ok(item, `Critical term ${key} must exist in glossary`);
    });
  });

  await t.test('4. searchGlossary filters correctly by query and category', () => {
    // Search by query
    const resultsQuan = searchGlossary('Chính Quan');
    assert.ok(resultsQuan.some((r) => r.id === 'chinh_quan'));

    // Search by English name
    const resultsDayMaster = searchGlossary('Day Master');
    assert.ok(resultsDayMaster.some((r) => r.id === 'nhat_chu'));

    // Search by category filter
    const ziweiPalaces = searchGlossary('', 'ziwei_palaces');
    assert.ok(ziweiPalaces.length > 0);
    assert.ok(ziweiPalaces.every((p) => p.category === 'ziwei_palaces'));

    // Search by keyword
    const resultsSun = searchGlossary('mat troi');
    assert.ok(resultsSun.some((r) => r.id === 'sao_thai_duong' || r.id === 'chan_gio_mat_troi'));
  });

  await t.test('5. Case-insensitivity (chữ hoa / chữ thường không phân biệt)', () => {
    const upperCaseResults = searchGlossary('CHÍNH QUAN');
    const lowerCaseResults = searchGlossary('chính quan');
    const mixedCaseResults = searchGlossary('cHíNh QuAn');

    assert.ok(upperCaseResults.some((r) => r.id === 'chinh_quan'), 'UPPERCASE search must find chinh_quan');
    assert.ok(lowerCaseResults.some((r) => r.id === 'chinh_quan'), 'lowercase search must find chinh_quan');
    assert.ok(mixedCaseResults.some((r) => r.id === 'chinh_quan'), 'mIxEdCaSe search must find chinh_quan');
  });

  await t.test('6. Vietnamese diacritics handling (có dấu & không dấu)', () => {
    // Có dấu
    const accentedResults = searchGlossary('Thất Sát');
    assert.ok(accentedResults.some((r) => r.id === 'that_sat'), 'Accented "Thất Sát" must find that_sat');

    // Không dấu
    const unaccentedResults = searchGlossary('that sat');
    assert.ok(unaccentedResults.some((r) => r.id === 'that_sat'), 'Unaccented "that sat" must find that_sat');

    // Dụng Thần không dấu
    const dungThanUnaccented = searchGlossary('dung than');
    assert.ok(dungThanUnaccented.some((r) => r.id === 'dung_than_hy_than'), 'Unaccented "dung than" must find dung_than_hy_than');

    // Cung Mệnh có dấu & không dấu
    const cungMenhAccented = searchGlossary('Cung Mệnh');
    const cungMenhUnaccented = searchGlossary('cung menh');
    assert.ok(cungMenhAccented.some((r) => r.id === 'cung_menh'));
    assert.ok(cungMenhUnaccented.some((r) => r.id === 'cung_menh'));
  });

  await t.test('7. Empty keyword and whitespace handling', () => {
    const emptyResults = searchGlossary('');
    assert.strictEqual(emptyResults.length, ASTROLOGY_GLOSSARY.length, 'Empty keyword must return all items');

    const whitespaceResults = searchGlossary('   ');
    assert.strictEqual(whitespaceResults.length, ASTROLOGY_GLOSSARY.length, 'Whitespace-only query must return all items');

    const nullResults = searchGlossary(null);
    assert.strictEqual(nullResults.length, ASTROLOGY_GLOSSARY.length, 'null query must return all items');

    const undefinedResults = searchGlossary(undefined);
    assert.strictEqual(undefinedResults.length, ASTROLOGY_GLOSSARY.length, 'undefined query must return all items');
  });

  await t.test('8. getGlossaryItemById returns item for existing IDs and undefined for non-existent IDs', () => {
    const item = getGlossaryItemById('non_existent_term_xyz');
    assert.strictEqual(item, undefined, 'Unknown ID should return undefined');

    const emptyIdItem = getGlossaryItemById('');
    assert.strictEqual(emptyIdItem, undefined, 'Empty ID should return undefined');

    const validItem = getGlossaryItemById('sao_tu_vi');
    assert.ok(validItem, 'Valid ID sao_tu_vi must return item');
    assert.strictEqual(validItem?.id, 'sao_tu_vi');
  });
});
