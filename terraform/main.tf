terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "aws_vpc" "shopselfcheckout_vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "shopselfcheckout-vpc"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.shopselfcheckout_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "eu-central-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "shopselfcheckout-public-subnet"
  }
}

resource "aws_eip" "eip" {
  vpc = true
  tags = {
    Name = "shopselfcheckout-eip"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.shopselfcheckout_vpc.id
  tags = {
    Name = "shopselfcheckout-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.shopselfcheckout_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = {
    Name = "shopselfcheckout-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public.id
}

output "vpc_id" {
  value = aws_vpc.shopselfcheckout_vpc.id
}

output "public_subnet_id" {
  value = aws_subnet.public_subnet.id
}
