import json
import unittest
from app import app
import data

class TestLostAndFoundAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health(self):
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        body = json.loads(res.data)
        self.assertEqual(body['status'], 'ok')

    def test_login_demo(self):
        # Mahasiswa login
        res = self.client.post('/api/login', json={'email': 'budi@student.telkomuniversity.ac.id'})
        self.assertEqual(res.status_code, 200)
        user = json.loads(res.data)
        self.assertEqual(user['role'], 'mahasiswa')
        self.assertEqual(user['nama'], 'Budi Santoso')

        # Admin login
        res_admin = self.client.post('/api/login', json={'email': 'admin.lostfound@telkomuniversity.ac.id'})
        self.assertEqual(res_admin.status_code, 200)
        admin = json.loads(res_admin.data)
        self.assertEqual(admin['role'], 'admin')

        # Invalid domain
        res_fail = self.client.post('/api/login', json={'email': 'test@gmail.com'})
        self.assertEqual(res_fail.status_code, 403)

    def test_items_flow(self):
        # List items
        res = self.client.get('/api/items')
        self.assertEqual(res.status_code, 200)
        items = json.loads(res.data)
        self.assertGreaterEqual(len(items), 4)

        # Create item
        new_item_payload = {
            "judul": "Payung Hitam",
            "kategori": "Lainnya",
            "lokasi": "Gedung Kuliah Bersama",
            "tanggal": "2026-11-25",
            "tipe": "found",
            "id_pelapor": 2
        }
        res_create = self.client.post('/api/items', json=new_item_payload, headers={'X-User-Id': '2'})
        self.assertEqual(res_create.status_code, 201)
        created = json.loads(res_create.data)
        self.assertEqual(created['status'], 'open')
        item_id = created['id']

        # Update item by owner (Budi)
        res_update = self.client.put(f'/api/items/{item_id}', json={"deskripsi": "Ada gantungan kunci"}, headers={'X-User-Id': '2'})
        self.assertEqual(res_update.status_code, 200)

        # Update item by unauthorized user (Siti)
        res_update_unauth = self.client.put(f'/api/items/{item_id}', json={"deskripsi": "Hacker"}, headers={'X-User-Id': '3'})
        self.assertEqual(res_update_unauth.status_code, 403)

        # Delete item by owner
        res_del = self.client.delete(f'/api/items/{item_id}', headers={'X-User-Id': '2'})
        self.assertEqual(res_del.status_code, 200)

    def test_claim_verification_flow(self):
        # Item 3 is open (KTM a.n. Andi, pelapor Siti id: 3)
        # Budi (id: 2) claims KTM
        claim_payload = {
            "id_barang": 3,
            "id_pengklaim": 2,
            "bukti_ciri": "Foto KTM saya dengan NIM 1030124001"
        }
        res_claim = self.client.post('/api/claims', json=claim_payload, headers={'X-User-Id': '2'})
        self.assertEqual(res_claim.status_code, 201)
        claim = json.loads(res_claim.data)
        self.assertEqual(claim['status'], 'pending')
        claim_id = claim['id']

        # Verify item status changed to claimed
        res_item = self.client.get('/api/items/3')
        item = json.loads(res_item.data)
        self.assertEqual(item['status'], 'claimed')

        # Siti (reporter) tries to claim her own item -> should fail
        res_self = self.client.post('/api/claims', json={"id_barang": 3, "bukti_ciri": "punya saya"}, headers={'X-User-Id': '3'})
        self.assertEqual(res_self.status_code, 400)

        # Another user can also submit a competing claim for comparison
        res_second = self.client.post('/api/claims', json={"id_barang": 3, "bukti_ciri": "KTM saya warna merah"}, headers={'X-User-Id': '4'})
        self.assertEqual(res_second.status_code, 201)
        second_claim_id = json.loads(res_second.data)['id']

        # Non-admin tries to approve claim -> 403
        res_approve_unauth = self.client.put(f'/api/claims/{claim_id}', json={"status": "approved"}, headers={'X-User-Id': '2'})
        self.assertEqual(res_approve_unauth.status_code, 403)

        # Admin approves claim -> 200
        res_approve = self.client.put(f'/api/claims/{claim_id}', json={"status": "approved"}, headers={'X-User-Id': '1'})
        self.assertEqual(res_approve.status_code, 200)
        approved_claim = json.loads(res_approve.data)
        self.assertEqual(approved_claim['status'], 'approved')

        # Verify item status changed to returned
        res_item_ret = self.client.get('/api/items/3')
        item_ret = json.loads(res_item_ret.data)
        self.assertEqual(item_ret['status'], 'returned')

if __name__ == '__main__':
    unittest.main()
