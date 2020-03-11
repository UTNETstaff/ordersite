from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator

class syozoku(models.Model):
    desc = models.CharField(max_length=32,blank=False,null=False,default="Undefined")

    def __str__(self):
        return self.desc

    class Meta:
        managed = True
        db_table = 'syozoku_list'
        verbose_name = '所属'
        verbose_name_plural = '所属'
        
class User(AbstractUser):
    syozoku = models.ForeignKey(syozoku,on_delete=models.PROTECT,default=4)
    tel = models.CharField(max_length=32,blank=True,null=True,default="nobody")

    def __str__(self):
        return self.username

class unit(models.Model):
    classifier = models.CharField(max_length=12,blank=False,null=False,default="nobody")

    def __str__(self):
        return self.classifier

    class Meta:
        managed = True
#        db_table = 'system_unit'
        verbose_name = '単位'
        verbose_name_plural = '単位'

class tax(models.Model):
    included = models.CharField(max_length=12,blank=False,null=False,default="nobody")

    def __str__(self):
        return self.included

    class Meta:
        managed = True
#        db_table = 'system_tax'
        verbose_name = '税'
        verbose_name_plural = '税'
    
class order_status(models.Model):
    status = models.CharField(max_length=16,blank=False,null=False,default="Undefined")

    def __str__(self):
        return self.status

    class Meta:
        managed = True
        db_table = 'order_status_list'
        verbose_name = '発注状況'
        verbose_name_plural = '発注状況'
    
        
class BudCode(models.Model):
    code = models.CharField(max_length=64,blank=False,null=False,default='Undefined')
    name = models.CharField(max_length=64,blank=False,null=False,default='Undefined')
    syozoku = models.ForeignKey(syozoku,on_delete=models.PROTECT)

    def __str__(self):
        return '{0},{1}'.format(self.name,self.code)

    class Meta:
        managed = True
        db_table = 'budcodes'
        verbose_name = '予算科目コード'
        verbose_name_plural = 'コード：予算科目コード'
    
class ProCode(models.Model):
    code = models.CharField(max_length=32,blank=False,null=False,default='Undefined')
    name = models.CharField(max_length=32,blank=False,null=False,default='Undefined')
    syozoku = models.ForeignKey(syozoku,on_delete=models.PROTECT)

    def __str__(self):
        return '{0},{1}'.format(self.name,self.code)

    class Meta:
        managed = True
        db_table = 'procodes'
        verbose_name = 'プロジェクトコード'
        verbose_name_plural = 'コード：プロジェクトコード'
    
class Bumon(models.Model):
    syozoku = models.ForeignKey(syozoku,on_delete=models.PROTECT)
    name = models.CharField(max_length=32,blank=False,null=False,default='Undefined')
    budget_manager = models.CharField(max_length=32,blank=False,null=False,default='Undefined')

    def __str__(self):
        return '{name} <予算責任者: {manager}>'.format(name=self.name,manager=self.budget_manager)

    class Meta:
        managed = True
        db_table = 'bumon'
        verbose_name = '部門'
        verbose_name_plural = '部門'

class DepCode(models.Model):
    code = models.CharField(max_length=32,blank=False,null=False,default='Undefined')
    name = models.CharField(max_length=32,blank=False,null=False,default='Undefined')
    syozoku = models.ForeignKey(syozoku,on_delete=models.PROTECT)

    def __str__(self):
        return '{name},{code}'.format(name=self.name,code=self.code)

    class Meta:
        managed = True
        db_table = 'depcodes'
        verbose_name = '部署コード'
        verbose_name_plural = 'コード：部署コード'

class Order(models.Model):
    nendo = models.CharField(max_length=32,blank=False,null=False,default='',
                             verbose_name='年度')
    bango = models.IntegerField(verbose_name='整理番号',validators=[MinValueValidator(0), MaxValueValidator(999999999999)])
    order_status = models.ForeignKey(order_status,on_delete=models.PROTECT,verbose_name='発注状況')
    order_date = models.DateField(default=timezone.now,verbose_name='依頼(発注)年月日')
    department = models.ForeignKey(Bumon,on_delete=models.PROTECT,verbose_name='部門<予算責任者>')
    #budget_manager = models.CharField(max_length=32,blank=False,null=False,verbose_name='予算責任者')
    orderer = models.CharField(max_length=32,blank=False,null=False,verbose_name='依頼(発注)者')
    phone = models.CharField(max_length=32,blank=False,null=False,verbose_name='連絡先')
    delivery_place = models.CharField(max_length=32,blank=True,null=True,verbose_name='納品場所')
    department_code = models.ForeignKey(DepCode,on_delete=models.PROTECT,verbose_name='部署名,コード')
    budget_subject_code = models.ForeignKey(BudCode,on_delete=models.PROTECT,verbose_name='予算科目名,コード')
    project_code = models.ForeignKey(ProCode,on_delete=models.PROTECT,verbose_name='プロジェクト名,コード')
    #department_code = models.CharField(max_length=32,blank=False,null=False,verbose_name='部署コード')
    #budget_subject_name= models.CharField(max_length=32,blank=False,null=False,verbose_name='予算科目名称')
    #budget_subject_code = models.CharField(max_length=32,blank=False,null=False,verbose_name='予算科目コード')
    #project_name = models.CharField(max_length=32,blank=False,null=False,verbose_name='プロジェクト名称')
    #project_code = models.CharField(max_length=32,blank=False,null=False,verbose_name='プロジェクトコード')
    item_name = models.TextField(blank=False,null=False,verbose_name='品名')
    kikaku = models.TextField(max_length=1024,blank=True,null=True,verbose_name='規格')
    suuryou = models.PositiveIntegerField(blank=False,null=False,verbose_name='数量',validators=[MinValueValidator(0), MaxValueValidator(999999999999)])
    tanni = models.ForeignKey(unit,on_delete=models.PROTECT,verbose_name='単位')
    tanka = models.PositiveIntegerField(blank=True,null=True,verbose_name='単価',validators=[MinValueValidator(0), MaxValueValidator(999999999999)])
    tanka_zei = models.ForeignKey(tax,on_delete=models.PROTECT,verbose_name='単価(税込/税抜)',
                                  related_name='tanka_zei')
    kingaku = models.PositiveIntegerField(blank=False,null=False,verbose_name='金額',validators=[MinValueValidator(0), MaxValueValidator(999999999999)])
    kingaku_zei = models.ForeignKey(tax,on_delete=models.PROTECT,verbose_name='金額(税込/税抜)',
                                    related_name='kingaku_zei')
    suppliers = models.CharField(max_length=64,blank=True,null=True,verbose_name='取引先名')
    invoice_number = models.CharField(max_length=32,blank=True,null=True,verbose_name='請求書番号')
    note = models.TextField(blank=True,null=True,verbose_name='備考')
    pdffile = models.FileField(blank=True,null=True,validators=[FileExtensionValidator(['pdf', ])],
    upload_to='pdffiles/',verbose_name='PDFファイル')
    syozoku = models.ForeignKey(syozoku,on_delete=models.PROTECT,verbose_name='所属ID(変更不可)')

#    readonly_fields = ('syozoku')

    def __str__(self):
        return str(self.id)

    class Meta:
        managed = True
        db_table = 'orders'
        verbose_name = '発注'
        verbose_name_plural = '発注データ'
