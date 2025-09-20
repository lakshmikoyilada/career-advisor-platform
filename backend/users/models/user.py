# users/models/user.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        if not name:
            raise ValueError("Users must have a name")
            
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            name=name,
            **extra_fields
        )
        
        if password:
            user.set_password(password)
            
        user.save(using=self._db)
        return user

class CustomUser(AbstractBaseUser):
    # Basic Information
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    hobbies = models.TextField(blank=True, null=True)
    
    # Education
    highest_qualification = models.CharField(max_length=100, blank=True, null=True)
    field_of_study = models.CharField(max_length=100, blank=True, null=True)
    passed_out_year = models.PositiveIntegerField(blank=True, null=True)
    
    # Skills and Experience
    technical_skills = models.TextField(blank=True, null=True)
    soft_skills = models.TextField(blank=True, null=True)
    interests = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    
    # Career Assessment
    core_work_passion = models.CharField(max_length=1, blank=True, null=True, choices=[
        ('a', 'Analyzing/logical'),
        ('b', 'Creating/designing'),
        ('c', 'Leading/organizing'),
        ('d', 'Helping/supporting')
    ])
    
    learning_style = models.CharField(max_length=1, blank=True, null=True, choices=[
        ('a', 'Through data/research'),
        ('b', 'Hands-on/experimentation'),
        ('c', 'Reading/research'),
        ('d', 'Applied/observing')
    ])
    
    work_environment = models.CharField(max_length=1, blank=True, null=True, choices=[
        ('a', 'Office/data systems'),
        ('b', 'Outdoors/on-site'),
        ('c', 'Creative studio/lab'),
        ('d', 'Team/community settings')
    ])
    
    key_strength = models.CharField(max_length=1, blank=True, null=True, choices=[
        ('a', 'Analytical thinking'),
        ('b', 'Creativity & innovation'),
        ('c', 'Communication & leadership'),
        ('d', 'Empathy & people skills')
    ])
    
    motivation_driver = models.CharField(max_length=1, blank=True, null=True, choices=[
        ('a', 'Solving problems'),
        ('b', 'Creating/innovating'),
        ('c', 'Guiding/managing'),
        ('d', 'Social impact')
    ])
    
    decision_style = models.CharField(max_length=1, blank=True, null=True, choices=[
        ('a', 'Break into data'),
        ('b', 'Creative approaches'),
        ('c', 'Group discussion'),
        ('d', 'People-focused'
    )]
    )
    
    interest_domain = models.CharField(max_length=1, blank=True, null=True, choices=[
        ('a', 'Technology & Data'),
        ('b', 'Creative Arts & Media'),
        ('c', 'Business & Management'),
        ('d', 'Social Service & Care'
    )]
    )
    
    values_lifestyle = models.CharField(max_length=1, blank=True, null=True, choices=[
        ('a', 'High income & stability'),
        ('b', 'Flexibility & creativity'),
        ('c', 'Growth & leadership'),
        ('d', 'Purpose & impact')
    ])
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    # def save(self, *args, **kwargs):
    #     if not self.password_hash:
    #         self.set_password(self.password_hash)
    #     super().save(*args, **kwargs)

    def __str__(self):
        return self.email